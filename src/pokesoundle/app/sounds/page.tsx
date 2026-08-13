import Link from "next/link";

import SoundLibrary from "@/components/SoundLibrary";
import GenerationSelector from "@/components/GenerationSelector";

export default function SoundsPage() {
    return (
        <main className="min-h-screen bg-pokesoundle-bg text-zinc-900">
            <div className="min-h-screen bg-grid-pattern px-3 py-6 sm:px-6 sm:py-10">

                <div className="mx-auto w-full max-w-5xl">

                    <header className="mb-6 text-center">
                        <h1 className="pokesoundle-logo">
                            PokeSoundle
                        </h1>

                        <div className="mt-3 flex justify-center">
              <span
                  className="
                  rounded-full
                  border-2 border-white/30
                  bg-black/20
                  px-4 py-1
                  text-xs font-bold
                  uppercase tracking-[0.25em]
                  text-white
                "
              >
                Sound Library
              </span>
                        </div>
                    </header>


                    <div
                        className="
              overflow-hidden
              rounded-[2rem]
              border-4 border-zinc-950
              bg-zinc-100
              shadow-2xl
            "
                    >

                        <div
                            className="
                flex
                items-center
                justify-between
                gap-3
                border-b-4
                border-zinc-950
                bg-blue-700
                px-4
                py-3
                sm:px-5
              "
                        >

                            <Link
                                href="/"
                                className="
                  rounded-lg
                  border-2
                  border-zinc-950
                  bg-white
                  px-3
                  py-2
                  text-xs
                  font-black
                  text-zinc-950
                  transition
                  hover:bg-zinc-200
                "
                            >
                                ← Reto diario
                            </Link>

                            <span
                                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-white
                "
                            >
                Pokédex
              </span>

                        </div>


                        <div
                            className="
                bg-zinc-100
                px-4
                py-7
                sm:px-8
              "
                        >

                            <div className="mb-8 flex justify-center">
                                <GenerationSelector />
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
                            Biblioteca de sonidos · PokeSoundle
                        </footer>

                    </div>

                </div>

            </div>
        </main>
    );
}