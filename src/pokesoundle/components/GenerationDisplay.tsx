"use client";

import {
    getGeneration,
} from "@/data/generations";

import {
    useGeneration,
} from "@/components/GenerationProvider";


export function GenerationBadge() {
    const {
        generation,
    } = useGeneration();

    const config =
        getGeneration(
            generation
        );

    return (
        <>
            {config.shortLabel.toUpperCase()}
        </>
    );
}


export function GenerationSubtitle() {
    const {
        generation,
    } = useGeneration();

    const config =
        getGeneration(
            generation
        );

    return (
        <>
            {config.region.toUpperCase()} CRY CHALLENGE
        </>
    );
}


export function GenerationRange() {
    const {
        generation,
    } = useGeneration();

    const config =
        getGeneration(
            generation
        );

    return (
        <>
            Pokémon {config.shortLabel}
            {" · "}
            #{String(
            config.firstPokemonId
        ).padStart(3, "0")}
            {"–"}
            #{String(
            config.lastPokemonId
        ).padStart(3, "0")}
        </>
    );
}