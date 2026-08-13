import pokemonDetails from "./pokemonDetails.json";

import type {
  GenerationId,
} from "@/data/generations";


export type Pokemon = {
  id: number;
  name: string;

  generation: GenerationId;

  cry: string;
  sprite: string;

  type1: string;
  type2: string | null;

  color: string;

  evolutionStage: number;

  height: number;
  weight: number;
};


type PokemonDetails = {
  id: number;
  name: string;

  /*
   * Los datos nuevos generados con
   * generatePokemonData.mjs ya tienen generation.
   *
   * Lo dejamos opcional temporalmente para soportar
   * los datos antiguos de Gen IV.
   */
  generation?: number;

  type1: string;
  type2: string | null;

  color: string;

  evolutionStage: number;

  height: number;
  weight: number;
};


const basePath =
    process.env.NEXT_PUBLIC_BASE_PATH ?? "";


// ==================================================
// GENERACIÓN SEGÚN NATIONAL DEX
// ==================================================

function getGenerationFromPokemonId(
    id: number
): GenerationId {
  if (id <= 151) {
    return 1;
  }

  if (id <= 251) {
    return 2;
  }

  if (id <= 386) {
    return 3;
  }

  if (id <= 493) {
    return 4;
  }

  if (id <= 649) {
    return 5;
  }

  if (id <= 721) {
    return 6;
  }

  if (id <= 809) {
    return 7;
  }

  if (id <= 905) {
    return 8;
  }

  if (id <= 1025) {
    return 9;
  }

  throw new Error(
      `No se puede determinar la generación del Pokémon #${id}.`
  );
}


// ==================================================
// DATOS
// ==================================================

export const pokemon: Pokemon[] =
    (
        pokemonDetails as PokemonDetails[]
    )
        .map(
            (details): Pokemon => {

              const generation =
                  details.generation
                      ? (
                          details.generation as GenerationId
                      )
                      : getGenerationFromPokemonId(
                          details.id
                      );


              return {
                id:
                details.id,

                name:
                details.name,

                generation,

                cry:
                    `${basePath}/cries/${details.id}.ogg`,

                sprite:
                    `${basePath}/sprites/${details.id}.png`,

                type1:
                details.type1,

                type2:
                details.type2,

                color:
                details.color,

                evolutionStage:
                details.evolutionStage,

                height:
                details.height,

                weight:
                details.weight,
              };
            }
        )

        /*
         * Dejamos siempre todo el dataset ordenado
         * por National Pokédex.
         */
        .sort(
            (a, b) =>
                a.id - b.id
        );


// ==================================================
// FILTRAR POR GENERACIÓN
// ==================================================

export function getPokemonByGeneration(
    generation: GenerationId
): Pokemon[] {
  return pokemon.filter(
      (item) =>
          item.generation === generation
  );
}