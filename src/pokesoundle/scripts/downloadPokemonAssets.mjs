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

const PROJECT_DIRECTORY =
    path.join(
        __dirname,
        ".."
    );

const DATA_FILE =
    path.join(
        PROJECT_DIRECTORY,
        "data",
        "pokemonDetails.json"
    );

const SPRITES_DIRECTORY =
    path.join(
        PROJECT_DIRECTORY,
        "public",
        "sprites"
    );

const CRIES_DIRECTORY =
    path.join(
        PROJECT_DIRECTORY,
        "public",
        "cries"
    );


// ==================================================
// CONFIGURACIÓN
// ==================================================

const API_BASE =
    "https://pokeapi.co/api/v2";

const CONCURRENCY = 8;

const MAX_RETRIES = 3;


// ==================================================
// ARGUMENTOS
// ==================================================

const generation =
    Number(
        process.argv[2]
    );

const force =
    process.argv.includes(
        "--force"
    );


if (
    !Number.isInteger(generation) ||
    generation < 1 ||
    generation > 9
) {
    console.error(
        "Uso: node scripts/downloadPokemonAssets.mjs <generación>"
    );

    console.error(
        "Ejemplo: node scripts/downloadPokemonAssets.mjs 1"
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


async function fetchWithRetry(
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

        return response;

    } catch (error) {

        if (
            attempt >=
            MAX_RETRIES
        ) {
            throw error;
        }

        const waitTime =
            attempt * 500;

        console.warn(
            `Error descargando ${url}. Reintentando en ${waitTime} ms...`
        );

        await sleep(
            waitTime
        );

        return fetchWithRetry(
            url,
            attempt + 1
        );
    }
}


async function fetchJson(
    url
) {
    const response =
        await fetchWithRetry(
            url
        );

    return response.json();
}


async function fileExists(
    filePath
) {
    try {
        await fs.access(
            filePath
        );

        return true;

    } catch {
        return false;
    }
}


async function downloadFile(
    url,
    outputFile
) {
    const response =
        await fetchWithRetry(
            url
        );

    const arrayBuffer =
        await response.arrayBuffer();

    const buffer =
        Buffer.from(
            arrayBuffer
        );

    await fs.writeFile(
        outputFile,
        buffer
    );
}


// ==================================================
// SPRITES
// ==================================================

/*
 * Elegimos el sprite correspondiente a la
 * generación.
 *
 * De momento tenemos configuradas las generaciones
 * que utiliza actualmente PokeSoundle.
 *
 * Cuando añadamos Gen II, III, etc. iremos
 * incorporando aquí su versión visual.
 */
function getSpriteUrl(
    pokemonData,
    generationId
) {
    const versions =
        pokemonData
            .sprites
            ?.versions;


    switch (
        generationId
        ) {

        // ----------------------------------------------
        // GEN I
        // Pokémon Red / Blue
        // ----------------------------------------------

        case 1:
            return (
                versions
                    ?.["generation-i"]
                    ?.["red-blue"]
                    ?.front_transparent
                ??
                versions
                    ?.["generation-i"]
                    ?.["red-blue"]
                    ?.front_default
                ??
                null
            );


        // ----------------------------------------------
        // GEN IV
        // Pokémon Platinum
        // ----------------------------------------------

        case 4:
            return (
                versions
                    ?.["generation-iv"]
                    ?.platinum
                    ?.front_default
                ??
                null
            );


        default:
            throw new Error(
                `Todavía no hay una fuente de sprites configurada para Gen ${generationId}.`
            );
    }
}


// ==================================================
// DATOS
// ==================================================

async function loadPokemonDetails() {
    const raw =
        await fs.readFile(
            DATA_FILE,
            "utf8"
        );

    const data =
        JSON.parse(
            raw
        );

    if (
        !Array.isArray(data)
    ) {
        throw new Error(
            "pokemonDetails.json no contiene un array válido."
        );
    }

    return data;
}


// ==================================================
// DESCARGAR UN POKÉMON
// ==================================================

async function downloadPokemonAssets(
    pokemon
) {
    const id =
        pokemon.id;

    const number =
        String(id).padStart(
            3,
            "0"
        );


    console.log(
        `#${number} ${pokemon.name}`
    );


    // ----------------------------------------------
    // POKÉAPI
    // ----------------------------------------------

    const pokemonData =
        await fetchJson(
            `${API_BASE}/pokemon/${id}/`
        );


    // ----------------------------------------------
    // SPRITE
    // ----------------------------------------------

    const spriteUrl =
        getSpriteUrl(
            pokemonData,
            generation
        );


    if (!spriteUrl) {
        throw new Error(
            `No se encontró sprite para #${id} ${pokemon.name}.`
        );
    }


    const spriteFile =
        path.join(
            SPRITES_DIRECTORY,
            `${id}.png`
        );


    const spriteAlreadyExists =
        await fileExists(
            spriteFile
        );


    if (
        force ||
        !spriteAlreadyExists
    ) {
        await downloadFile(
            spriteUrl,
            spriteFile
        );

        console.log(
            `  ✓ sprite`
        );

    } else {

        console.log(
            `  - sprite ya existe`
        );
    }


    // ----------------------------------------------
    // CRY
    // ----------------------------------------------

    const cryUrl =
        pokemonData
            .cries
            ?.legacy;


    if (!cryUrl) {
        throw new Error(
            `No se encontró legacy cry para #${id} ${pokemon.name}.`
        );
    }


    const cryFile =
        path.join(
            CRIES_DIRECTORY,
            `${id}.ogg`
        );


    const cryAlreadyExists =
        await fileExists(
            cryFile
        );


    if (
        force ||
        !cryAlreadyExists
    ) {
        await downloadFile(
            cryUrl,
            cryFile
        );

        console.log(
            `  ✓ cry`
        );

    } else {

        console.log(
            `  - cry ya existe`
        );
    }
}


// ==================================================
// PROCESAR POR BLOQUES
// ==================================================

async function processInBatches(
    items,
    batchSize,
    callback
) {
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


        const currentBatch =
            Math.floor(
                index / batchSize
            ) + 1;


        const totalBatches =
            Math.ceil(
                items.length /
                batchSize
            );


        console.log("");
        console.log(
            `Bloque ${currentBatch}/${totalBatches}`
        );


        await Promise.all(
            batch.map(
                callback
            )
        );
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
        ` PokeSoundle Assets - Generación ${generation}`
    );

    console.log(
        "=========================================="
    );

    console.log("");


    // ----------------------------------------------
    // DIRECTORIOS
    // ----------------------------------------------

    await fs.mkdir(
        SPRITES_DIRECTORY,
        {
            recursive: true,
        }
    );


    await fs.mkdir(
        CRIES_DIRECTORY,
        {
            recursive: true,
        }
    );


    // ----------------------------------------------
    // DATOS
    // ----------------------------------------------

    const pokemonDetails =
        await loadPokemonDetails();


    const generationPokemon =
        pokemonDetails
            .filter(
                (pokemon) =>
                    Number(
                        pokemon.generation
                    ) === generation
            )
            .sort(
                (a, b) =>
                    a.id - b.id
            );


    if (
        generationPokemon.length ===
        0
    ) {
        throw new Error(
            `No hay Pokémon de Gen ${generation} en pokemonDetails.json.`
        );
    }


    console.log(
        `${generationPokemon.length} Pokémon encontrados.`
    );


    if (force) {
        console.log(
            "Modo --force: se sobrescribirán los archivos existentes."
        );
    }


    // ----------------------------------------------
    // DESCARGA
    // ----------------------------------------------

    await processInBatches(
        generationPokemon,
        CONCURRENCY,
        downloadPokemonAssets
    );


    console.log("");
    console.log(
        "=========================================="
    );

    console.log(
        ` Assets de Gen ${generation} completados`
    );

    console.log(
        ` Pokémon procesados: ${generationPokemon.length}`
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
            "Error descargando los assets:"
        );

        console.error(
            error
        );

        process.exit(1);
    }
);