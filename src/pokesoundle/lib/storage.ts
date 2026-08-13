import type {
  GenerationId,
} from "@/data/generations";

export type StoredGame = {
  guesses: number[];
  completed: boolean;
};


function getStorageKey(
    generation: GenerationId,
    gameNumber: number
) {
  return `pokesoundle-game-gen${generation}-${gameNumber}`;
}


/**
 * Clave utilizada anteriormente,
 * antes de soportar generaciones.
 *
 * Solo se usa para migrar las partidas
 * existentes de Gen IV.
 */
function getLegacyStorageKey(
    gameNumber: number
) {
  return `pokesoundle-game-${gameNumber}`;
}


export function loadGame(
    generation: GenerationId,
    gameNumber: number
): StoredGame | null {
  if (
      typeof window ===
      "undefined"
  ) {
    return null;
  }

  const key =
      getStorageKey(
          generation,
          gameNumber
      );

  let stored =
      localStorage.getItem(key);


  /*
   * Migración automática de las partidas
   * antiguas de Gen IV.
   */
  if (
      !stored &&
      generation === 4
  ) {
    const legacyKey =
        getLegacyStorageKey(
            gameNumber
        );

    const legacy =
        localStorage.getItem(
            legacyKey
        );

    if (legacy) {
      stored = legacy;

      localStorage.setItem(
          key,
          legacy
      );
    }
  }


  if (!stored) {
    return null;
  }


  try {
    const parsed =
        JSON.parse(
            stored
        ) as StoredGame;

    if (
        !Array.isArray(
            parsed.guesses
        ) ||
        typeof parsed.completed !==
        "boolean"
    ) {
      return null;
    }

    return parsed;

  } catch {
    return null;
  }
}


export function saveGame(
    generation: GenerationId,
    gameNumber: number,
    game: StoredGame
) {
  if (
      typeof window ===
      "undefined"
  ) {
    return;
  }

  const key =
      getStorageKey(
          generation,
          gameNumber
      );

  localStorage.setItem(
      key,
      JSON.stringify(game)
  );
}