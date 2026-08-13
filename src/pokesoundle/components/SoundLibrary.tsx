"use client";

import Image from "next/image";

import {
    useMemo,
    useRef,
    useState,
} from "react";

import {
    getPokemonByGeneration,
    type Pokemon,
} from "@/data/pokemon";

import {
    getGeneration,
} from "@/data/generations";

import {
    useGeneration,
} from "@/components/GenerationProvider";


export default function SoundLibrary() {

    // ==================================================
    // GENERACIÓN
    // ==================================================

    const {
        generation,
    } = useGeneration();


    const generationConfig =
        getGeneration(
            generation
        );


    /*
     * Obtenemos solamente los Pokémon
     * de la generación seleccionada
     * y los ordenamos por número de Pokédex.
     */
    const generationPokemon =
        useMemo(
            () =>
                [
                    ...getPokemonByGeneration(
                        generation
                    ),
                ].sort(
                    (a, b) =>
                        a.id - b.id
                ),
            [generation]
        );


    // ==================================================
    // AUDIO
    // ==================================================

    const audioRef =
        useRef<HTMLAudioElement>(
            null
        );


    const [
        playingPokemonId,
        setPlayingPokemonId,
    ] =
        useState<number | null>(
            null
        );


    function playCry(
        pokemon: Pokemon
    ) {
        if (!audioRef.current) {
            return;
        }


        /*
         * Cambiamos el archivo de audio
         * al Pokémon seleccionado.
         */
        audioRef.current.src =
            pokemon.cry;

        audioRef.current.currentTime =
            0;


        setPlayingPokemonId(
            pokemon.id
        );


        audioRef.current
            .play()
            .catch(
                (error) => {
                    console.error(
                        "No se pudo reproducir el sonido:",
                        error
                    );

                    setPlayingPokemonId(
                        null
                    );
                }
            );
    }


    // ==================================================
    // UI
    // ==================================================

    return (
        <section>

            {/* ============================================== */}
            {/* INFORMACIÓN */}
            {/* ============================================== */}

            <div
                className="
          mb-8
          text-center
        "
            >

                <p
                    className="
            text-sm
            font-black
            uppercase
            tracking-[0.15em]
            text-blue-700
          "
                >
                    {generationConfig.shortLabel}
                    {" · "}
                    {generationConfig.region}
                </p>


                <h2
                    className="
            mt-2
            text-2xl
            font-black
            text-zinc-900
          "
                >
                    Biblioteca de sonidos
                </h2>


                <p
                    className="
            mx-auto
            mt-2
            max-w-lg
            text-sm
            text-zinc-500
          "
                >
                    Pulsa sobre un Pokémon para escuchar su grito.
                </p>

            </div>


            {/* ============================================== */}
            {/* AUDIO GLOBAL */}
            {/* ============================================== */}

            <audio
                ref={audioRef}
                preload="none"
                onEnded={() =>
                    setPlayingPokemonId(
                        null
                    )
                }
            />


            {/* ============================================== */}
            {/* GRID DE POKÉMON */}
            {/* ============================================== */}

            <div
                className="
          grid
          grid-cols-3
          gap-3

          sm:grid-cols-4

          md:grid-cols-5

          lg:grid-cols-6
        "
            >

                {generationPokemon.map(
                    (pokemon) => {

                        const isPlaying =
                            playingPokemonId ===
                            pokemon.id;


                        return (

                            <button
                                key={
                                    pokemon.id
                                }
                                type="button"
                                onClick={() =>
                                    playCry(
                                        pokemon
                                    )
                                }
                                aria-label={
                                    `Reproducir sonido de ${pokemon.name}`
                                }
                                className={`
                  group
                  relative
                  flex
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border-2
                  p-3
                  transition

                  ${
                                    isPlaying
                                        ? `
                        border-yellow-500
                        bg-yellow-100
                        shadow-[0_4px_0_#18181b]
                      `
                                        : `
                        border-zinc-300
                        bg-white
                        hover:-translate-y-1
                        hover:border-blue-500
                        hover:shadow-md
                      `
                                }
                `}
                            >

                                {/* SPRITE */}

                                <div
                                    className="
                    relative
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center

                    sm:h-24
                    sm:w-24
                  "
                                >

                                    <Image
                                        src={
                                            pokemon.sprite
                                        }
                                        alt={
                                            pokemon.name
                                        }
                                        width={96}
                                        height={96}
                                        className="
                      [image-rendering:pixelated]
                      transition
                      group-hover:scale-110
                    "
                                    />


                                    {/* INDICADOR DE AUDIO */}

                                    {isPlaying && (

                                        <div
                                            className="
                        absolute
                        right-0
                        top-0
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-zinc-950
                        bg-yellow-400
                        text-xs
                      "
                                        >
                                            ♪
                                        </div>

                                    )}

                                </div>


                                {/* NOMBRE */}

                                <span
                                    className="
                    mt-1
                    max-w-full
                    truncate
                    text-sm
                    font-black
                    text-zinc-900
                  "
                                >
                  {pokemon.name}
                </span>


                                {/* NÚMERO POKÉDEX */}

                                <span
                                    className="
                    mt-0.5
                    text-xs
                    font-semibold
                    text-zinc-500
                  "
                                >
                  #
                                    {String(
                                        pokemon.id
                                    ).padStart(
                                        3,
                                        "0"
                                    )}
                </span>

                            </button>

                        );
                    }
                )}

            </div>


            {/* ============================================== */}
            {/* CONTADOR */}
            {/* ============================================== */}

            <p
                className="
          mt-8
          text-center
          text-xs
          font-semibold
          text-zinc-500
        "
            >
                {
                    generationPokemon.length
                } Pokémon
            </p>

        </section>
    );
}