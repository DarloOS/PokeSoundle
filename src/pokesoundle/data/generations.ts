export type GenerationId =
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9;

export type GenerationConfig = {
    id: GenerationId;
    label: string;
    shortLabel: string;
    region: string;

    firstPokemonId: number;
    lastPokemonId: number;

    enabled: boolean;

    // Cada generación puede empezar su reto diario
    // en una fecha distinta.
    launchDate: string | null;
};

export const generations: GenerationConfig[] = [
    {
        id: 1,
        label: "Generación I",
        shortLabel: "Gen I",
        region: "Kanto",
        firstPokemonId: 1,
        lastPokemonId: 151,
        enabled: true,
        launchDate: "2026-08-13",
    },
    {
        id: 2,
        label: "Generación II",
        shortLabel: "Gen II",
        region: "Johto",
        firstPokemonId: 152,
        lastPokemonId: 251,
        enabled: false,
        launchDate: null,
    },
    {
        id: 3,
        label: "Generación III",
        shortLabel: "Gen III",
        region: "Hoenn",
        firstPokemonId: 252,
        lastPokemonId: 386,
        enabled: false,
        launchDate: null,
    },
    {
        id: 4,
        label: "Generación IV",
        shortLabel: "Gen IV",
        region: "Sinnoh",
        firstPokemonId: 387,
        lastPokemonId: 493,
        enabled: true,
        launchDate: "2026-08-12",
    },
    {
        id: 5,
        label: "Generación V",
        shortLabel: "Gen V",
        region: "Unova",
        firstPokemonId: 494,
        lastPokemonId: 649,
        enabled: false,
        launchDate: null,
    },
    {
        id: 6,
        label: "Generación VI",
        shortLabel: "Gen VI",
        region: "Kalos",
        firstPokemonId: 650,
        lastPokemonId: 721,
        enabled: false,
        launchDate: null,
    },
    {
        id: 7,
        label: "Generación VII",
        shortLabel: "Gen VII",
        region: "Alola",
        firstPokemonId: 722,
        lastPokemonId: 809,
        enabled: false,
        launchDate: null,
    },
    {
        id: 8,
        label: "Generación VIII",
        shortLabel: "Gen VIII",
        region: "Galar",
        firstPokemonId: 810,
        lastPokemonId: 905,
        enabled: false,
        launchDate: null,
    },
    {
        id: 9,
        label: "Generación IX",
        shortLabel: "Gen IX",
        region: "Paldea",
        firstPokemonId: 906,
        lastPokemonId: 1025,
        enabled: false,
        launchDate: null,
    },
];

export const DEFAULT_GENERATION: GenerationId = 4;

export function getGeneration(
    id: GenerationId
): GenerationConfig {
    const generation = generations.find(
        (item) => item.id === id
    );

    if (!generation) {
        throw new Error(
            `No existe la generación ${id}.`
        );
    }

    return generation;
}

export function getEnabledGenerations() {
    return generations.filter(
        (generation) => generation.enabled
    );
}