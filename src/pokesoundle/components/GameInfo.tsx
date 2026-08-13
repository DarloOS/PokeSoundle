"use client";

import { useEffect, useState } from "react";

export default function GameInfo() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        document.body.style.overflow = "hidden";

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            {/* Botón i */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Información y créditos"
                className="
          flex h-10 w-10
          items-center justify-center
          rounded-full
          border-2 border-zinc-950
          bg-cyan-300
          text-lg font-black
          text-zinc-950
          shadow-[0_3px_0_#18181b]
          transition
          hover:bg-cyan-200
          active:translate-y-[3px]
          active:shadow-none
        "
            >
                i
            </button>

            {open && (
                <div
                    className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
                    onMouseDown={() => setOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="game-info-title"
                        onMouseDown={(event) => event.stopPropagation()}
                        className="
              max-h-[90vh]
              w-full max-w-lg
              overflow-y-auto
              rounded-[1.5rem]
              border-4 border-zinc-950
              bg-zinc-100
              text-zinc-950
              shadow-2xl
            "
                    >
                        {/* Cabecera */}
                        <div
                            className="
                flex items-center justify-between
                border-b-4 border-zinc-950
                bg-blue-700
                px-5 py-3
              "
                        >
                            <h2
                                id="game-info-title"
                                className="text-xl font-black text-white"
                            >
                                Sobre PokeSoundle
                            </h2>

                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                aria-label="Cerrar"
                                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border-2 border-zinc-950
                  bg-white
                  text-xl font-black
                  transition
                  hover:bg-zinc-200
                "
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6 p-5 sm:p-6">

                            {/* Descripción */}
                            <section>
                                <h3 className="text-lg font-black">
                                    PokeSoundle
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-zinc-700">
                                    PokeSoundle es un juego diario en el que tienes
                                    que adivinar un Pokémon de cuarta generación
                                    escuchando su grito original de la era Nintendo DS.
                                </p>

                                <p className="mt-2 text-sm leading-6 text-zinc-700">
                                    El proyecto está inspirado en{" "}
                                    <strong>Pokedle</strong>, adaptando su sistema de
                                    pistas a un juego centrado en los sonidos de los
                                    Pokémon de Sinnoh.
                                </p>
                            </section>

                            {/* Créditos */}
                            <section>
                                <h3 className="mb-3 text-lg font-black">
                                    Créditos
                                </h3>

                                <div className="space-y-3">
                                    <CreditItem
                                        title="PokéAPI"
                                        description="Datos de los Pokémon como tipos, color, altura, peso y cadenas evolutivas."
                                    />

                                    <CreditItem
                                        title="PokéAPI Sprites"
                                        description="Sprites utilizados en el buscador, los intentos y la pantalla de victoria."
                                    />

                                    <CreditItem
                                        title="PokéAPI Cries"
                                        description="Archivos de los gritos utilizados por el juego."
                                    />

                                    <CreditItem
                                        title="Pokedle"
                                        description="Principal inspiración para la mecánica de pistas y el formato de reto diario."
                                    />
                                </div>
                            </section>

                            {/* Proyecto */}
                            <section
                                className="
                  rounded-xl
                  border-2 border-zinc-300
                  bg-white
                  p-4
                "
                            >
                                <p className="font-black">
                                    Proyecto personal
                                </p>

                                <p className="mt-1 text-sm leading-6 text-zinc-600">
                                    PokeSoundle ha sido desarrollado como un proyecto
                                    personal y gratuito. No requiere registro y no
                                    almacena cuentas de usuario.
                                </p>
                            </section>

                            {/* Disclaimer */}
                            <section
                                className="
                  rounded-xl
                  border-2 border-yellow-500
                  bg-yellow-50
                  p-4
                "
                            >
                                <p className="font-black text-zinc-950">
                                    Proyecto fan no oficial
                                </p>

                                <p className="mt-1 text-xs leading-5 text-zinc-700">
                                    PokeSoundle es un proyecto fan independiente y no
                                    está afiliado, respaldado ni patrocinado por
                                    Nintendo, Game Freak, Creatures Inc. o The Pokémon
                                    Company.
                                </p>

                                <p className="mt-2 text-xs leading-5 text-zinc-700">
                                    Pokémon y los elementos relacionados con la
                                    franquicia pertenecen a sus respectivos titulares.
                                </p>
                            </section>

                            {/* GitHub */}
                            <section className="text-center">
                                <a
                                    href="https://github.com/darloos/PokeSoundle"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                    inline-flex
                    items-center justify-center
                    rounded-xl
                    border-2 border-zinc-950
                    bg-zinc-900
                    px-5 py-3
                    text-sm font-bold
                    text-white
                    shadow-[0_3px_0_#52525b]
                    transition
                    hover:bg-zinc-800
                    active:translate-y-[3px]
                    active:shadow-none
                  "
                                >
                                    Ver proyecto en GitHub
                                </a>
                            </section>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CreditItem({
                        title,
                        description,
                    }: {
    title: string;
    description: string;
}) {
    return (
        <div
            className="
        rounded-xl
        border-2 border-zinc-200
        bg-white
        p-3
      "
        >
            <p className="text-sm font-black">
                {title}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-600">
                {description}
            </p>
        </div>
    );
}