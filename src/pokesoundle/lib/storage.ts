export type StoredGame = {
    guesses: number[];
    completed: boolean;
};

function getStorageKey(gameNumber: number): string {
    return `pokesoundle-game-${gameNumber}`;
}

export function loadGame(
    gameNumber: number
): StoredGame | null {
    if (typeof window === "undefined") {
        return null;
    }

    const saved = localStorage.getItem(
        getStorageKey(gameNumber)
    );

    if (!saved) {
        return null;
    }

    try {
        const parsed = JSON.parse(saved);

        if (
            !Array.isArray(parsed.guesses) ||
            typeof parsed.completed !== "boolean"
        ) {
            return null;
        }

        return {
            guesses: parsed.guesses,
            completed: parsed.completed,
        };
    } catch {
        return null;
    }
}

export function saveGame(
    gameNumber: number,
    game: StoredGame
) {
    localStorage.setItem(
        getStorageKey(gameNumber),
        JSON.stringify(game)
    );
}