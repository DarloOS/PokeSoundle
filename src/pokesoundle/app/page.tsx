import PokeSoundleGame from "@/components/PokeSoundleGame";
import HowToPlay from "@/components/HowToPlay";
import GameInfo from "@/components/GameInfo";
import Link from "next/link";
import GenerationSelector from "@/components/GenerationSelector";
import {
  GenerationBadge,
  GenerationSubtitle,
  GenerationRange,
} from "@/components/GenerationDisplay";

export default function Home() {
  return (
      <main className="min-h-screen bg-pokesoundle-bg text-zinc-900">
        <div className="min-h-screen bg-grid-pattern px-3 py-6 sm:px-6 sm:py-10">

          <div className="mx-auto w-full max-w-5xl">

            {/* Cabecera */}
            <header className="mb-6 text-center">
              <div className="inline-flex flex-col items-center">
                <h1 className="pokesoundle-logo">
                  PokeSoundle
                </h1>

                <div className="mt-2 rounded-full border-2 border-white/30 bg-black/20 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-white">
                  <GenerationSubtitle />
                </div>
              </div>
            </header>

            <div className="mt-4 flex justify-center">
              <GenerationSelector />
            </div>

            {/* Consola / Pokédex */}
            <div className="overflow-hidden rounded-[2rem] border-4 border-zinc-950 bg-zinc-100 shadow-2xl">

              {/* Barra superior roja */}
              <div className="flex items-center justify-between border-b-4 border-zinc-950 bg-red-600 px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-zinc-950 bg-cyan-300" />
                  <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-yellow-300" />
                  <span className="h-3 w-3 rounded-full border-2 border-zinc-950 bg-green-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
                    <GenerationBadge />
                  </span>
                  <Link
                      href="/sounds"
                      aria-label="Biblioteca de sonidos"
                      title="Biblioteca de sonidos"
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border-2
                        border-zinc-950
                        bg-green-400
                        text-lg
                        shadow-[0_3px_0_#18181b]
                        transition
                        hover:bg-green-300
                        active:translate-y-[3px]
                        active:shadow-none
                      "
                      >
                      ♪
                  </Link>
                  <Link
                      href="/practice"
                      className="
                        rounded-full
                        border-2 border-zinc-950
                        bg-blue-500
                        px-4 py-2
                        text-xs font-black
                        text-white
                        shadow-[0_3px_0_#18181b]
                        transition
                        hover:bg-blue-400
                        active:translate-y-[3px]
                        active:shadow-none
                      "
                  >
                    Práctica
                  </Link>
                  <GameInfo />
                  <HowToPlay />
                </div>
              </div>

              {/* Zona de juego */}
              <div className="bg-zinc-100 px-4 py-7 sm:px-8">
                <PokeSoundleGame />
              </div>

              {/* Barra inferior */}
              <footer className="border-t-4 border-zinc-950 bg-zinc-900 px-5 py-3 text-center text-xs font-medium text-zinc-400">
                <GenerationRange />
              </footer>

            </div>
          </div>
        </div>
      </main>
  );
}