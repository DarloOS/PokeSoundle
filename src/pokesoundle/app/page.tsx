import PokeSoundleGame from "@/components/PokeSoundleGame";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black tracking-tight">PokeSoundle</h1>

          <p className="mt-2 text-sm text-zinc-400">
            Adivina el Pokémon de cuarta generación por su grito
          </p>
        </header>

        <PokeSoundleGame />

        <footer className="mt-12 border-t border-zinc-800 pt-5 text-center text-xs text-zinc-600">
          Pokémon Gen. IV · 387–493
        </footer>
      </div>
    </main>
  );
}
