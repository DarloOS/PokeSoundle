import {
  getGeneration,
  type GenerationId,
} from "@/data/generations";

import {
  getPokemonByGeneration,
  type Pokemon,
} from "@/data/pokemon";

const TIME_ZONE = "Europe/Madrid";

const DAY_IN_MS = 24 * 60 * 60 * 1000;


/**
 * Devuelve la fecha YYYY-MM-DD correspondiente
 * a Europe/Madrid.
 */
function getMadridDateString(
    date: Date = new Date()
): string {
  const formatter =
      new Intl.DateTimeFormat("en-CA", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

  return formatter.format(date);
}


/**
 * Convierte YYYY-MM-DD en un número de día.
 *
 * Utilizamos UTC únicamente para calcular
 * correctamente la diferencia entre dos fechas.
 */
function dateToDayNumber(
    dateString: string
): number {
  const [year, month, day] =
      dateString
          .split("-")
          .map(Number);

  return Math.floor(
      Date.UTC(
          year,
          month - 1,
          day
      ) / DAY_IN_MS
  );
}


/**
 * Número del PokeSoundle para una generación.
 *
 * El día de lanzamiento es PokeSoundle #1.
 */
export function getPokeSoundleNumber(
    generation: GenerationId,
    date: Date = new Date()
): number {
  const config =
      getGeneration(generation);

  if (!config.launchDate) {
    throw new Error(
        `${config.label} todavía no tiene fecha de lanzamiento.`
    );
  }

  const currentDate =
      getMadridDateString(date);

  const currentDay =
      dateToDayNumber(currentDate);

  const launchDay =
      dateToDayNumber(
          config.launchDate
      );

  const difference =
      currentDay - launchDay;

  return Math.max(
      1,
      difference + 1
  );
}


/**
 * Pokémon diario de una generación.
 */
export function getDailyPokemon(
    generation: GenerationId,
    date: Date = new Date()
): Pokemon {
  const generationPokemon =
      getPokemonByGeneration(
          generation
      );

  if (
      generationPokemon.length === 0
  ) {
    throw new Error(
        `No hay Pokémon cargados para la generación ${generation}.`
    );
  }

  const gameNumber =
      getPokeSoundleNumber(
          generation,
          date
      );

  const dayIndex =
      gameNumber - 1;

  /*
   * Mantenemos la misma fórmula que usaba
   * actualmente Gen IV.
   *
   * Así NO cambia el Pokémon diario que
   * corresponde a los PokeSoundle existentes.
   */
  const pokemonIndex =
      (
          dayIndex * 37 +
          17
      ) %
      generationPokemon.length;

  return generationPokemon[
      pokemonIndex
      ];
}