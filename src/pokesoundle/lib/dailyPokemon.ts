import { pokemon, Pokemon } from "@/data/pokemon";

const LAUNCH_DATE = "2026-08-12";
const TIME_ZONE = "Europe/Madrid";

/**
 * Obtiene la fecha YYYY-MM-DD correspondiente a España peninsular.
 */
function getDateInMadrid(date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    const parts = formatter.formatToParts(date);

    const year = parts.find((part) => part.type === "year")!.value;
    const month = parts.find((part) => part.type === "month")!.value;
    const day = parts.find((part) => part.type === "day")!.value;

    return `${year}-${month}-${day}`;
}

/**
 * Convierte YYYY-MM-DD en un número de días.
 * Usamos UTC aquí para evitar problemas con cambios de horario.
 */
function dateToDayNumber(dateString: string): number {
    const [year, month, day] = dateString.split("-").map(Number);

    return Math.floor(
        Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24)
    );
}

/**
 * Número de PokeSoundle:
 * Día de lanzamiento = 1
 */
export function getPokeSoundleNumber(date: Date = new Date()): number {
    const today = getDateInMadrid(date);

    const launchDay = dateToDayNumber(LAUNCH_DATE);
    const currentDay = dateToDayNumber(today);

    return Math.max(1, currentDay - launchDay + 1);
}

/**
 * Devuelve el Pokémon correspondiente a ese día.
 *
 * 37 es coprimo con 107, por lo que recorreremos los
 * 107 Pokémon sin repetir antes de completar el ciclo.
 */
export function getDailyPokemon(date: Date = new Date()): Pokemon {
    const dayNumber = getPokeSoundleNumber(date);
    const dayIndex = dayNumber - 1;

    const pokemonIndex =
        (dayIndex * 37 + 17) % pokemon.length;

    return pokemon[pokemonIndex];
}