import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const START_ID = 387;
const END_ID = 493;
const TARGET_GENERATION = 4;

// ------------------------------------------------------
// RUTAS
// ------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// scripts/ está al mismo nivel que data/
const DATA_DIRECTORY = path.join(__dirname, "..", "data");
const OUTPUT_FILE = path.join(DATA_DIRECTORY, "pokemonDetails.json");

// ------------------------------------------------------
// GENERACIONES
// ------------------------------------------------------

function generationNumber(name) {
  const roman = name.replace("generation-", "");

  const values = {
    i: 1,
    ii: 2,
    iii: 3,
    iv: 4,
    v: 5,
    vi: 6,
    vii: 7,
    viii: 8,
    ix: 9,
  };

  return values[roman];
}

// ------------------------------------------------------
// TIPOS DE GENERACIÓN IV
// ------------------------------------------------------

function getGeneration4Types(data) {
  /*
   * PokéAPI devuelve los tipos actuales en data.types.
   *
   * Algunos Pokémon cambiaron de tipo posteriormente.
   * Por ejemplo, el tipo Hada no existía en Gen IV.
   *
   * past_types permite recuperar sus tipos históricos.
   */

  const historicalTypes = data.past_types
    .map((entry) => ({
      generation: generationNumber(entry.generation.name),

      types: [...entry.types]
        .sort((a, b) => a.slot - b.slot)
        .map((item) => item.type.name),
    }))
    .filter((entry) => entry.generation >= TARGET_GENERATION)
    .sort((a, b) => a.generation - b.generation);

  if (historicalTypes.length > 0) {
    return historicalTypes[0].types;
  }

  return [...data.types]
    .sort((a, b) => a.slot - b.slot)
    .map((item) => item.type.name);
}

// ------------------------------------------------------
// ETAPA EVOLUTIVA
// ------------------------------------------------------

function findEvolutionStage(chain, targetId, stage = 1) {
  const speciesId = Number(chain.species.url.split("/").filter(Boolean).pop());

  // Hemos encontrado el Pokémon
  if (speciesId === targetId) {
    return stage;
  }

  // Buscamos recursivamente en sus evoluciones
  for (const evolution of chain.evolves_to) {
    const result = findEvolutionStage(evolution, targetId, stage + 1);

    if (result !== null) {
      return result;
    }
  }

  return null;
}

// ------------------------------------------------------
// DESCARGA
// ------------------------------------------------------

async function fetchJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error ${response.status} descargando ${url}`);
  }

  return response.json();
}

// Evitamos descargar varias veces una misma cadena evolutiva.
const evolutionCache = new Map();

const result = [];

// ------------------------------------------------------
// GENERACIÓN DE LOS 107 POKÉMON
// ------------------------------------------------------

for (let id = START_ID; id <= END_ID; id++) {
  console.log(`Descargando #${id}...`);

  const [pokemon, species] = await Promise.all([
    fetchJson(`https://pokeapi.co/api/v2/pokemon/${id}`),

    fetchJson(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
  ]);

  // -----------------------------
  // Tipos de Gen IV
  // -----------------------------

  const types = getGeneration4Types(pokemon);

  const type1 = types[0] ?? null;
  const type2 = types[1] ?? null;

  // -----------------------------
  // Cadena evolutiva
  // -----------------------------

  const evolutionUrl = species.evolution_chain.url;

  let evolutionChain;

  if (evolutionCache.has(evolutionUrl)) {
    evolutionChain = evolutionCache.get(evolutionUrl);
  } else {
    evolutionChain = await fetchJson(evolutionUrl);

    evolutionCache.set(evolutionUrl, evolutionChain);
  }

  const evolutionStage = findEvolutionStage(evolutionChain.chain, id);

  if (evolutionStage === null) {
    throw new Error(
      `No se pudo encontrar la etapa evolutiva del Pokémon #${id}`,
    );
  }

  // -----------------------------
  // Guardamos los datos
  // -----------------------------

  result.push({
    id,

    type1,
    type2,

    color: species.color.name,

    evolutionStage,

    // PokéAPI devuelve altura en decímetros.
    height: pokemon.height / 10,

    // PokéAPI devuelve peso en hectogramos.
    weight: pokemon.weight / 10,
  });
}

// ------------------------------------------------------
// GUARDAR JSON
// ------------------------------------------------------

// Por seguridad, creamos data/ si no existe.
await fs.mkdir(DATA_DIRECTORY, {
  recursive: true,
});

await fs.writeFile(OUTPUT_FILE, JSON.stringify(result, null, 2), "utf8");

console.log("");
console.log("✅ Datos generados correctamente.");
console.log(`✅ Pokémon: ${result.length}`);
console.log(`✅ Archivo: ${OUTPUT_FILE}`);
