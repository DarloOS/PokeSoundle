"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import { pokemon, type Pokemon } from "@/data/pokemon";

const sortedPokemon = [...pokemon].sort(
    (a, b) => a.id - b.id
);

export default function SoundLibrary() {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [playingId, setPlayingId] =
        useState<number | null>(null);

    function playCry(item: Pokemon) {
        const audio = audioRef.current;

        if (!audio) {
            return;
        }

        // Detenemos el sonido anterior
        audio.pause();

        audio.src = item.cry;
        audio.currentTime = 0;

        setPlayingId(item.id);

        audio.play().catch((error) => {
            console.error(
                "No se pudo reproducir el grito:",
                error
            );

            setPlayingId(null);
        });
    }

    return (
        <>
            <audio
                ref={audioRef}
                onEnded={() => setPlayingId(null)}
                onPause={() => {
                    if (
                        audioRef.current &&
                        audioRef.current.currentTime !== 0
                    ) {
                        return;
                    }

                    setPlayingId(null);
                }}
            />

            <div
                className="
          grid
          grid-cols-2
          gap-3
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-5
          xl:grid-cols-6
        "
            >
                {sortedPokemon.map((item) => {
                    const isPlaying =
                        playingId === item.id;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => playCry(item)}
                            aria-label={`Reproducir grito de ${item.name}`}
                            className={`
                group
                relative
                flex
                flex-col
                items-center
                rounded-2xl
                border-2
                p-3
                text-zinc-950
                transition

                hover:-translate-y-1
                hover:shadow-lg

                active:translate-y-0

                ${
                                isPlaying
                                    ? "border-yellow-500 bg-yellow-100 shadow-lg"
                                    : "border-zinc-300 bg-white hover:border-blue-500"
                            }
              `}
                        >
                            {/* Número */}
                            <span
                                className="
                  absolute
                  left-3
                  top-3
                  text-xs
                  font-black
                  text-zinc-400
                "
                            >
                #{item.id}
              </span>

                            {/* Indicador de sonido */}
                            <span
                                className={`
                  absolute
                  right-3
                  top-3
                  text-lg
                  transition

                  ${
                                    isPlaying
                                        ? "scale-110"
                                        : "opacity-40 group-hover:opacity-100"
                                }
                `}
                            >
                {isPlaying ? "🔊" : "🔈"}
              </span>

                            {/* Sprite */}
                            <div
                                className="
                  mt-4
                  flex
                  h-28
                  w-28
                  items-center
                  justify-center
                "
                            >
                                <Image
                                    src={item.sprite}
                                    alt={item.name}
                                    width={112}
                                    height={112}
                                    className="
                    h-28
                    w-28
                    object-contain
                    transition
                    [image-rendering:pixelated]

                    group-hover:scale-110
                  "
                                />
                            </div>

                            {/* Nombre */}
                            <p
                                className="
                  mt-2
                  text-center
                  text-sm
                  font-black
                  sm:text-base
                "
                            >
                                {item.name}
                            </p>

                            <p
                                className="
                  mt-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-widest
                  text-zinc-400
                "
                            >
                                {isPlaying
                                    ? "Reproduciendo"
                                    : "Escuchar"}
                            </p>
                        </button>
                    );
                })}
            </div>
        </>
    );
}