"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    generations,
    getGeneration,
} from "@/data/generations";

import {
    useGeneration,
} from "@/components/GenerationProvider";


export default function GenerationSelector() {
    const {
        generation,
        setGeneration,
    } = useGeneration();

    const [
        isOpen,
        setIsOpen,
    ] =
        useState(false);

    const containerRef =
        useRef<HTMLDivElement>(
            null
        );


    const currentGeneration =
        getGeneration(
            generation
        );


    // ==================================================
    // CERRAR AL HACER CLICK FUERA
    // ==================================================

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node
                )
            ) {
                setIsOpen(false);
            }
        }


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);


    // ==================================================
    // CERRAR CON ESCAPE
    // ==================================================

    useEffect(() => {
        function handleKeyDown(
            event: KeyboardEvent
        ) {
            if (
                event.key === "Escape"
            ) {
                setIsOpen(false);
            }
        }


        document.addEventListener(
            "keydown",
            handleKeyDown
        );


        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);


    // ==================================================
    // SELECCIONAR
    // ==================================================

    function handleSelect(
        generationId:
        typeof generation
    ) {
        const selectedGeneration =
            generations.find(
                (item) =>
                    item.id ===
                    generationId
            );


        if (
            !selectedGeneration ||
            !selectedGeneration.enabled
        ) {
            return;
        }


        setGeneration(
            generationId
        );

        setIsOpen(false);
    }


    return (
        <div
            ref={containerRef}
            className="
        relative
        z-40
        w-full
        max-w-sm
      "
        >

            {/* ============================================ */}
            {/* BOTÓN PRINCIPAL */}
            {/* ============================================ */}

            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (current) =>
                            !current
                    )
                }
                aria-expanded={
                    isOpen
                }
                aria-haspopup="listbox"
                className="
          group
          flex
          w-full
          items-center
          justify-between
          gap-4
          rounded-xl
          border-2
          border-zinc-950
          bg-white
          px-4
          py-3
          text-left
          shadow-[0_4px_0_#18181b]
          transition

          hover:-translate-y-0.5
          hover:bg-zinc-50
          hover:shadow-[0_5px_0_#18181b]

          active:translate-y-1
          active:shadow-none
        "
            >

                {/* GENERACIÓN ACTUAL */}

                <div
                    className="
            flex
            items-center
            gap-3
          "
                >

                    {/* INDICADOR */}

                    <div
                        className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              border-2
              border-zinc-950
              bg-red-600
            "
                    >
                        <div
                            className="
                h-3
                w-3
                rounded-full
                border-2
                border-zinc-950
                bg-white
              "
                        />
                    </div>


                    <div>

                        <p
                            className="
                text-xs
                font-black
                uppercase
                tracking-[0.15em]
                text-zinc-500
              "
                        >
                            {currentGeneration.shortLabel}
                        </p>

                        <p
                            className="
                text-base
                font-black
                text-zinc-950
              "
                        >
                            {currentGeneration.region}
                        </p>

                    </div>

                </div>


                {/* FLECHA */}

                <span
                    className={`
            text-lg
            font-black
            text-zinc-700
            transition-transform
            duration-200

            ${
                        isOpen
                            ? "rotate-180"
                            : ""
                    }
          `}
                >
          ▼
        </span>

            </button>


            {/* ============================================ */}
            {/* MENÚ */}
            {/* ============================================ */}

            {isOpen && (

                <div
                    className="
            absolute
            left-1/2
            top-[calc(100%+0.75rem)]
            z-50
            w-[min(92vw,520px)]
            -translate-x-1/2
            overflow-hidden
            rounded-2xl
            border-2
            border-zinc-950
            bg-zinc-100
            shadow-[0_10px_0_rgba(24,24,27,0.35)]
          "
                >

                    {/* CABECERA */}

                    <div
                        className="
              flex
              items-center
              justify-between
              border-b-2
              border-zinc-950
              bg-red-600
              px-4
              py-3
              text-white
            "
                    >

                        <div>

                            <p
                                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.2em]
                "
                            >
                                Seleccionar región
                            </p>

                            <p
                                className="
                  mt-0.5
                  text-xs
                  font-medium
                  text-red-100
                "
                            >
                                Elige una generación
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setIsOpen(false)
                            }
                            aria-label="Cerrar selector de generación"
                            className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                border-2
                border-zinc-950
                bg-white
                font-black
                text-zinc-950
                transition
                hover:bg-zinc-200
              "
                        >
                            ×
                        </button>

                    </div>


                    {/* ======================================== */}
                    {/* GENERACIONES */}
                    {/* ======================================== */}

                    <div
                        role="listbox"
                        aria-label="Generaciones Pokémon"
                        className="
              grid
              grid-cols-2
              gap-3
              p-4

              sm:grid-cols-3
            "
                    >

                        {generations.map(
                            (item) => {

                                const isSelected =
                                    item.id ===
                                    generation;

                                const isEnabled =
                                    item.enabled;


                                return (

                                    <button
                                        key={
                                            item.id
                                        }
                                        type="button"
                                        role="option"
                                        aria-selected={
                                            isSelected
                                        }
                                        disabled={
                                            !isEnabled
                                        }
                                        onClick={() =>
                                            handleSelect(
                                                item.id
                                            )
                                        }
                                        className={`
                      relative
                      min-h-28
                      overflow-hidden
                      rounded-xl
                      border-2
                      p-3
                      text-left
                      transition

                      ${
                                            isSelected
                                                ? `
                            border-zinc-950
                            bg-yellow-300
                            shadow-[0_4px_0_#18181b]
                          `
                                                : isEnabled
                                                    ? `
                              border-zinc-400
                              bg-white
                              hover:-translate-y-1
                              hover:border-blue-600
                              hover:shadow-[0_4px_0_#18181b]
                            `
                                                    : `
                              cursor-not-allowed
                              border-zinc-300
                              bg-zinc-200
                              opacity-60
                            `
                                        }
                    `}
                                    >

                                        {/* GEN */}

                                        <p
                                            className={`
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.15em]

                        ${
                                                isEnabled
                                                    ? "text-blue-700"
                                                    : "text-zinc-500"
                                            }
                      `}
                                        >
                                            {item.shortLabel}
                                        </p>


                                        {/* REGIÓN */}

                                        <p
                                            className="
                        mt-1
                        text-lg
                        font-black
                        text-zinc-950
                      "
                                        >
                                            {item.region}
                                        </p>


                                        {/* RANGO */}

                                        <p
                                            className="
                        mt-1
                        text-xs
                        font-semibold
                        text-zinc-500
                      "
                                        >
                                            #
                                            {String(
                                                item.firstPokemonId
                                            ).padStart(
                                                3,
                                                "0"
                                            )}

                                            {" – "}

                                            #
                                            {String(
                                                item.lastPokemonId
                                            ).padStart(
                                                3,
                                                "0"
                                            )}
                                        </p>


                                        {/* ESTADO */}

                                        {isSelected ? (

                                            <span
                                                className="
                          absolute
                          bottom-2
                          right-2
                          rounded-full
                          border
                          border-zinc-950
                          bg-zinc-950
                          px-2
                          py-1
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wide
                          text-white
                        "
                                            >
                        Activa
                      </span>

                                        ) : !isEnabled ? (

                                            <span
                                                className="
                          absolute
                          bottom-2
                          right-2
                          rounded-full
                          bg-zinc-300
                          px-2
                          py-1
                          text-[10px]
                          font-black
                          uppercase
                          tracking-wide
                          text-zinc-600
                        "
                                            >
                        🔒 Próximamente
                      </span>

                                        ) : null}

                                    </button>

                                );
                            }
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}