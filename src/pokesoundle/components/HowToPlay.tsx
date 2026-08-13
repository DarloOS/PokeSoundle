"use client";

import { useEffect, useState } from "react";

export default function HowToPlay() {
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
            {/* Botón ? */}
            <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Cómo jugar"
                className="
          flex h-10 w-10
          items-center justify-center
          rounded-full
          border-2 border-zinc-950
          bg-yellow-400
          text-xl font-black
          text-zinc-950
          shadow-[0_3px_0_#18181b]
          transition
          hover:bg-yellow-300
          active:translate-y-[3px]
          active:shadow-none
        "
            >
                ?
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
                        aria-labelledby="how-to-play-title"
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
                        {/* Barra superior */}
                        <div
                            className="
                flex items-center justify-between
                border-b-4 border-zinc-950
                bg-red-600
                px-5 py-3
              "
                        >
                            <h2
                                id="how-to-play-title"
                                className="text-xl font-black text-white"
                            >
                                Cómo jugar
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

                            {/* Introducción */}
                            <div>
                                <p className="font-semibold">
                                    Adivina el Pokémon de cuarta generación
                                    escuchando su grito original de Nintendo DS.
                                </p>

                                <p className="mt-2 text-sm text-zinc-600">
                                    Hay un Pokémon nuevo cada día y tienes
                                    intentos ilimitados hasta encontrarlo.
                                </p>
                            </div>

                            {/* Pasos */}
                            <div className="space-y-3">
                                <HowToStep
                                    number="1"
                                    text="Pulsa la Poké Ball para escuchar el grito."
                                />

                                <HowToStep
                                    number="2"
                                    text="Busca y selecciona un Pokémon de la cuarta generación."
                                />

                                <HowToStep
                                    number="3"
                                    text="Usa las pistas de cada intento para acercarte a la respuesta."
                                />
                            </div>

                            {/* Colores */}
                            <div>
                                <h3 className="mb-3 font-black">
                                    Significado de los colores
                                </h3>

                                <div className="space-y-2">
                                    <Legend
                                        color="green"
                                        title="Correcto"
                                        description="El dato coincide exactamente con el Pokémon."
                                    />

                                    <Legend
                                        color="yellow"
                                        title="Tipo presente"
                                        description="El tipo es correcto, pero está en la otra posición."
                                    />

                                    <Legend
                                        color="red"
                                        title="Incorrecto"
                                        description="El dato no coincide con el Pokémon."
                                    />
                                </div>
                            </div>

                            {/* Flechas */}
                            <div>
                                <h3 className="mb-3 font-black">
                                    Flechas
                                </h3>

                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        className="
                      rounded-xl
                      border-2 border-zinc-300
                      bg-white p-3
                      text-center
                    "
                                    >
                                        <p className="text-3xl font-black">↑</p>
                                        <p className="mt-1 text-sm text-zinc-600">
                                            La respuesta tiene un valor mayor
                                        </p>
                                    </div>

                                    <div
                                        className="
                      rounded-xl
                      border-2 border-zinc-300
                      bg-white p-3
                      text-center
                    "
                                    >
                                        <p className="text-3xl font-black">↓</p>
                                        <p className="mt-1 text-sm text-zinc-600">
                                            La respuesta tiene un valor menor
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-2 text-xs text-zinc-500">
                                    Las flechas se aplican a etapa evolutiva,
                                    altura y peso.
                                </p>
                            </div>

                            {/* Cambio diario */}
                            <div
                                className="
                  rounded-xl
                  border-2 border-blue-800
                  bg-blue-50
                  p-4
                "
                            >
                                <p className="font-black text-blue-950">
                                    Un reto cada día
                                </p>

                                <p className="mt-1 text-sm text-blue-900">
                                    Cuando aciertas, el reto termina. Tendrás
                                    que esperar al siguiente PokeSoundle para
                                    descubrir un nuevo Pokémon.
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function HowToStep({
                       number,
                       text,
                   }: {
    number: string;
    text: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div
                className="
          flex h-9 w-9 shrink-0
          items-center justify-center
          rounded-full
          border-2 border-zinc-950
          bg-yellow-400
          font-black
        "
            >
                {number}
            </div>

            <p className="text-sm font-medium">
                {text}
            </p>
        </div>
    );
}

function Legend({
                    color,
                    title,
                    description,
                }: {
    color: "green" | "yellow" | "red";
    title: string;
    description: string;
}) {
    const colors = {
        green: "border-green-500 bg-green-600 text-white",
        yellow: "border-yellow-400 bg-yellow-400 text-zinc-950",
        red: "border-red-500 bg-red-700 text-white",
    };

    return (
        <div className="flex items-center gap-3">
            <div
                className={`
          flex h-12 w-12 shrink-0
          items-center justify-center
          rounded-lg border-2
          font-black
          ${colors[color]}
        `}
            >
                ✓
            </div>

            <div>
                <p className="text-sm font-black">
                    {title}
                </p>

                <p className="text-xs text-zinc-600">
                    {description}
                </p>
            </div>
        </div>
    );
}