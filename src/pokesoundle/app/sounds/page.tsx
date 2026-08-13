import type { Metadata } from "next";
import Link from "next/link";

import SoundLibrary from "@/components/SoundLibrary";

export const metadata: Metadata = {
    title: "Biblioteca de sonidos | PokeSoundle",
    description:
        "Escucha los gritos de los 107 Pokémon de cuarta generación.",
};

export default function SoundsPage() {
    return (
        <main className="min-h-screen bg-pokesoundle-bg text-zinc-900">
            <div className="min-h-screen bg-grid-pattern px-3 py-6 sm:px-6 sm:py-10">

                <div className="mx-auto w-full max-w-6xl">

                    {/* Cabecera */}
                    <header className="mb-6 text-center">

                        <Link
                            href="/"
                            className="
                inline-block
                text-4xl
                font-black
                text-yellow-400
                [-webkit-text-stroke:2px_#173b70]
                sm:text-5xl
              "
                        >
                            PokeSoundle
                        </Link>

                        <p
                            className="
                mt-3
                text-sm
                font-bold
                uppercase
                tracking-[0.2em]
                text-white/80
              "
                        >
                            Biblioteca de sonidos
                        </p>

                    </header>

                    {/* Pokédex */}
                    <section
                        className="
              overflow-hidden
              rounded-[2rem]
              border-4
              border-zinc-950
              bg-zinc-100
              shadow-2xl
            "
                    >

                        {/* Barra superior */}
                        <div
                            className="
                flex
                items-center
                justify-between
                border-b-4
                border-zinc-950
                bg-red-600
                px-5
                py-3
              "
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-4 w-4 rounded-full border-2 border-zinc-950 bg-cyan-300" />
                                <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-yellow-300" />
                                <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-green-400" />
                            </div>

                            <span
                                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-white
                "
                            >
                Gen IV
              </span>
                        </div>

                        {/* Contenido */}
                        <div className="p-4 sm:p-6 lg:p-8">

                            <div
                                className="
                  mb-7
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
                            >
                                <div>
                                    <h1
                                        className="
                      text-2xl
                      font-black
                      sm:text-3xl
                    "
                                    >
                                        Biblioteca de sonidos
                                    </h1>

                                    <p
                                        className="
                      mt-1
                      text-sm
                      text-zinc-600
                    "
                                    >
                                        Pulsa un Pokémon para escuchar
                                        su grito original de Nintendo DS.
                                    </p>
                                </div>

                                <Link
                                    href="/"
                                    className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border-2
                    border-zinc-950
                    bg-yellow-400
                    px-4
                    py-2
                    text-sm
                    font-black
                    text-zinc-950
                    shadow-[0_3px_0_#18181b]
                    transition
                    hover:bg-yellow-300
                    active:translate-y-[3px]
                    active:shadow-none
                  "
                                >
                                    ← Volver al juego
                                </Link>
                            </div>

                            <SoundLibrary />

                        </div>

                        <footer
                            className="
                border-t-4
                border-zinc-950
                bg-zinc-900
                px-5
                py-3
                text-center
                text-xs
                font-medium
                text-zinc-400
              "
                        >
                            107 Pokémon · #387–493
                        </footer>

                    </section>

                </div>
            </div>
        </main>
    );
}