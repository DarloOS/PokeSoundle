import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";


// ==================================================
// RUTAS
// ==================================================

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);

const DATA_DIRECTORY =
    path.join(
        __dirname,
        "..",
        "data"
    );

const OUTPUT_FILE =
    path.join(
        DATA_DIRECTORY,
        "pokemonDetails.json"
    );


// ==================================================
// CONFIGURACIÓN
// ==================================================

const API_BASE =
    "https://pokeapi.co/api/v2";

const CONCURRENCY = 8;

const MAX_RETRIES = 3;


// ==================================================
// GENERACIÓN PEDIDA
// ==================================================

const generation =
    Number(
        process.argv[2]
    );


if (
    !Number.isInteger(generation) ||
    generation < 1 ||
    generation > 9
) {
  console.error(
      "Uso: node scripts/generatePokemonData.mjs <generación>"
  );

  console.error(
      "Ejemplo: node scripts/generatePokemonData.mjs 1"
  );

  process.exit(1);
}


// ==================================================
// UTILIDADES
// ==================================================

function sleep(ms) {
  return new Promise(
      (resolve) =>
          setTimeout(
              resolve,
              ms
          )
  );
}


async function fetchJson(
    url,
    attempt = 1
) {
  try {
    const response =
        await fetch(url);

    if (!response.ok) {
      throw new Error(
          `${response.status} ${response.statusText}`
      );
    }

    return await response.json();

  } catch (error) {

    if (
        attempt >=
        MAX_RETRIES
    ) {
      throw error;
    }

    const waitTime =
        500 * attempt;

    console.warn(
        `Error consultando ${url}. Reintentando en ${waitTime} ms...`
    );

    await sleep(
        waitTime
    );

    return fetchJson(
        url,
        attempt + 1
    );
  }
}


/*
 * Extrae el ID del final de una URL de PokéAPI.
 *
 * Ejemplo:
 *
 * https://pokeapi.co/api/v2/pokemon-species/25/
 *
 * -> 25
 */
function getIdFromUrl(
    url
) {
  const parts =
      url
          .split("/")
          .filter(Boolean);

  return Number(
      parts[
      parts.length - 1
          ]
  );
}


// ==================================================
// GENERACIONES
// ==================================================

/*
 * Devuelve las especies INTRODUCIDAS
 * en una generación.
 */
async function getSpeciesForGeneration(
    generationId
) {
  const data =
      await fetchJson(
          `${API_BASE}/generation/${generationId}/`
      );

  return data
      .pokemon_species
      .map(
          (species) => ({
            id:
                getIdFromUrl(
                    species.url
                ),

            name:
            species.name,

            url:
            species.url,
          })
      )
      .sort(
          (a, b) =>
              a.id - b.id
      );
}


/*
 * Para calcular correctamente la etapa evolutiva
 * necesitamos saber qué Pokémon existían YA
 * en la generación seleccionada.
 *
 * Por ejemplo:
 *
 * En Gen III Roselia existía,
 * pero Budew todavía no.
 *
 * Por tanto Roselia no debería aparecer como
 * etapa 2 en un juego ambientado en Gen III.
 */
async function getAvailableSpeciesIds(
    targetGeneration
) {
  const available =
      new Set();

  for (
      let currentGeneration = 1;
      currentGeneration <=
      targetGeneration;
      currentGeneration++
  ) {
    const species =
        await getSpeciesForGeneration(
            currentGeneration
        );

    for (
        const pokemon of species
        ) {
      available.add(
          pokemon.id
      );
    }
  }

  return available;
}


// ==================================================
// NOMBRES
// ==================================================

function getEnglishName(
    speciesData
) {
  const englishName =
      speciesData.names.find(
          (entry) =>
              entry.language.name ===
              "en"
      );

  if (englishName) {
    return englishName.name;
  }

  return speciesData.name;
}


// ==================================================
// TIPOS HISTÓRICOS
// ==================================================

/*
 * El campo past_types indica los tipos que
 * tenía un Pokémon hasta una determinada
 * generación.
 *
 * Ejemplo conceptual:
 *
 * Clefairy:
 *
 * Gen I-V -> Normal
 * Gen VI+  -> Fairy
 */
function getGenerationNumber(
    generationResource
) {
  return getIdFromUrl(
      generationResource.url
  );
}


function getTypesForGeneration(
    pokemonData,
    targetGeneration
) {
  const historicalTypes =
      pokemonData.past_types
          .map(
              (entry) => ({
                generation:
                    getGenerationNumber(
                        entry.generation
                    ),

                types:
                entry.types,
              })
          )

          /*
           * Si el registro dice "hasta Gen V",
           * también es válido para Gen I-IV.
           */
          .filter(
              (entry) =>
                  entry.generation >=
                  targetGeneration
          )

          /*
           * Nos interesa el cambio histórico
           * más cercano a nuestra generación.
           */
          .sort(
              (a, b) =>
                  a.generation -
                  b.generation
          );


  const selectedTypes =
      historicalTypes.length > 0
          ? historicalTypes[0].types
          : pokemonData.types;


  const sortedTypes =
      [...selectedTypes].sort(
          (a, b) =>
              a.slot - b.slot
      );


  return {
    type1:
        sortedTypes[0]
            ?.type
            .name ??
        null,

    type2:
        sortedTypes[1]
            ?.type
            .name ??
        null,
  };
}


// ==================================================
// EVOLUCIONES
// ==================================================

/*
 * Cacheamos cadenas porque muchos Pokémon
 * pertenecen a la misma.
 *
 * Bulbasaur, Ivysaur y Venusaur, por ejemplo,
 * utilizan una única consulta de cadena.
 */
const evolutionChainCache =
    new Map();


async function getEvolutionChain(
    url
) {
  if (
      evolutionChainCache.has(
          url
      )
  ) {
    return evolutionChainCache.get(
        url
    );
  }


  const request =
      fetchJson(
          url
      );


  evolutionChainCache.set(
      url,
      request
  );


  return request;
}


/*
 * Busca la etapa del Pokémon dentro de la
 * cadena evolutiva.
 *
 * Solo contamos especies que ya existían
 * en la generación que estamos generando.
 */
function findEvolutionStage(
    node,
    targetPokemonId,
    availableSpeciesIds,
    previousStage = 0
) {
  const nodeId =
      getIdFromUrl(
          node.species.url
      );


  const existsInGeneration =
      availableSpeciesIds.has(
          nodeId
      );


  const currentStage =
      existsInGeneration
          ? previousStage + 1
          : previousStage;


  if (
      nodeId ===
      targetPokemonId
  ) {
    return Math.max(
        1,
        currentStage
    );
  }


  for (
      const evolution of
      node.evolves_to
      ) {
    const result =
        findEvolutionStage(
            evolution,
            targetPokemonId,
            availableSpeciesIds,
            currentStage
        );


    if (
        result !== null
    ) {
      return result;
    }
  }


  return null;
}


// ==================================================
// CREAR DATOS DE UN POKÉMON
// ==================================================

async function generatePokemonDetails(
    id,
    targetGeneration,
    availableSpeciesIds
) {
  const [
    pokemonData,
    speciesData,
  ] =
      await Promise.all([
        fetchJson(
            `${API_BASE}/pokemon/${id}/`
        ),

        fetchJson(
            `${API_BASE}/pokemon-species/${id}/`
        ),
      ]);


  // ----------------------------------------------
  // TIPOS
  // ----------------------------------------------

  const {
    type1,
    type2,
  } =
      getTypesForGeneration(
          pokemonData,
          targetGeneration
      );


  // ----------------------------------------------
  // EVOLUCIÓN
  // ----------------------------------------------

  let evolutionStage = 1;


  if (
      speciesData
          .evolution_chain
          ?.url
  ) {
    const evolutionData =
        await getEvolutionChain(
            speciesData
                .evolution_chain
                .url
        );


    const calculatedStage =
        findEvolutionStage(
            evolutionData.chain,
            id,
            availableSpeciesIds
        );


    if (
        calculatedStage !== null
    ) {
      evolutionStage =
          calculatedStage;
    }
  }


  // ----------------------------------------------
  // RESULTADO
  // ----------------------------------------------

  return {
    id,

    name:
        getEnglishName(
            speciesData
        ),

    generation:
    targetGeneration,

    type1,

    type2,

    color:
        speciesData
            .color
            ?.name ??
        "unknown",

    evolutionStage,

    /*
     * PokéAPI devuelve:
     *
     * altura en decímetros
     * peso en hectogramos
     *
     * Los convertimos a metros y kg.
     */
    height:
        pokemonData.height /
        10,

    weight:
        pokemonData.weight /
        10,
  };
}


// ==================================================
// CONCURRENCIA
// ==================================================

async function processInBatches(
    items,
    batchSize,
    callback
) {
  const results = [];


  for (
      let index = 0;
      index < items.length;
      index += batchSize
  ) {
    const batch =
        items.slice(
            index,
            index + batchSize
        );


    const batchNumber =
        Math.floor(
            index /
            batchSize
        ) + 1;


    const totalBatches =
        Math.ceil(
            items.length /
            batchSize
        );


    console.log(
        `Procesando bloque ${batchNumber}/${totalBatches}...`
    );


    const batchResults =
        await Promise.all(
            batch.map(
                callback
            )
        );


    results.push(
        ...batchResults
    );
  }


  return results;
}


// ==================================================
// LEER DATOS EXISTENTES
// ==================================================

async function loadExistingData() {
  try {
    const raw =
        await fs.readFile(
            OUTPUT_FILE,
            "utf8"
        );


    const parsed =
        JSON.parse(
            raw
        );


    if (
        Array.isArray(parsed)
    ) {
      return parsed;
    }


    return [];

  } catch (error) {

    if (
        error.code ===
        "ENOENT"
    ) {
      return [];
    }


    throw error;
  }
}


// ==================================================
// MAIN
// ==================================================

async function main() {
  console.log("");
  console.log(
      "=========================================="
  );
  console.log(
      ` PokeSoundle - Generación ${generation}`
  );
  console.log(
      "=========================================="
  );
  console.log("");


  // ----------------------------------------------
  // ESPECIES DE LA GENERACIÓN
  // ----------------------------------------------

  console.log(
      "Obteniendo especies de la generación..."
  );


  const targetSpecies =
      await getSpeciesForGeneration(
          generation
      );


  console.log(
      `${targetSpecies.length} especies encontradas.`
  );


  // ----------------------------------------------
  // ESPECIES DISPONIBLES HISTÓRICAMENTE
  // ----------------------------------------------

  console.log(
      "Calculando especies disponibles en esta generación..."
  );


  const availableSpeciesIds =
      await getAvailableSpeciesIds(
          generation
      );


  // ----------------------------------------------
  // GENERAR DATOS
  // ----------------------------------------------

  console.log(
      "Generando información de Pokémon..."
  );


  const generatedData =
      await processInBatches(
          targetSpecies,
          CONCURRENCY,

          async (
              species
          ) => {

            console.log(
                `#${String(
                    species.id
                ).padStart(
                    3,
                    "0"
                )} ${species.name}`
            );


            return generatePokemonDetails(
                species.id,
                generation,
                availableSpeciesIds
            );
          }
      );


  // ----------------------------------------------
  // DATOS QUE YA TENÍAMOS
  // ----------------------------------------------

  const existingData =
      await loadExistingData();


  const generatedIds =
      new Set(
          generatedData.map(
              (pokemon) =>
                  pokemon.id
          )
      );


  /*
   * Quitamos solamente los Pokémon que acabamos
   * de regenerar.
   *
   * Esto permite añadir Gen I sin borrar Gen IV.
   */
  const preservedData =
      existingData.filter(
          (pokemon) =>
              !generatedIds.has(
                  pokemon.id
              )
      );


  const finalData =
      [
        ...preservedData,
        ...generatedData,
      ].sort(
          (a, b) =>
              a.id - b.id
      );


  // ----------------------------------------------
  // GUARDAR
  // ----------------------------------------------

  await fs.mkdir(
      DATA_DIRECTORY,
      {
        recursive: true,
      }
  );


  await fs.writeFile(
      OUTPUT_FILE,
      JSON.stringify(
          finalData,
          null,
          2
      ) + "\n",
      "utf8"
  );


  console.log("");
  console.log(
      "=========================================="
  );

  console.log(
      `Generación ${generation} completada.`
  );

  console.log(
      `Pokémon generados: ${generatedData.length}`
  );

  console.log(
      `Pokémon totales en JSON: ${finalData.length}`
  );

  console.log(
      `Archivo: ${OUTPUT_FILE}`
  );

  console.log(
      "=========================================="
  );
  console.log("");
}


main().catch(
    (error) => {
      console.error("");
      console.error(
          "Error generando los datos:"
      );

      console.error(
          error
      );

      process.exit(1);
    }
);