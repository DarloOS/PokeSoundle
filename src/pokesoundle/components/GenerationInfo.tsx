"use client";

import {
    getGeneration,
} from "@/data/generations";

import {
    useGeneration,
} from "@/components/GenerationProvider";

export default function GenerationInfo() {
    const {
        generation,
    } = useGeneration();

    const config =
        getGeneration(
            generation
        );

    return (
        <>
      <span>
        {config.shortLabel}
      </span>

            <span>
        {config.region}
      </span>

            <span>
        #{config.firstPokemonId}
                {"–"}
                #{config.lastPokemonId}
      </span>
        </>
    );
}