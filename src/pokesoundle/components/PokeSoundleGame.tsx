"use client";

import NextPokemonCountdown from "@/components/NextPokemonCountdown";
import Image from "next/image";
import type { FormEvent } from "react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { pokemon, type Pokemon } from "@/data/pokemon";

import {
    getDailyPokemon,
    getPokeSoundleNumber,
} from "@/lib/dailyPokemon";

import {
    loadGame,
    saveGame,
} from "@/lib/storage";

import {
    getColorName,
    getTypeName,
} from "@/lib/pokemonLabels";

import GuessCell from "@/components/GuessCell";


export default function PokeSoundleGame() {

    // --------------------------------------------------
    // POKÉMON DEL DÍA
    // --------------------------------------------------

    const answer = getDailyPokemon();
    const gameNumber = getPokeSoundleNumber();


    // --------------------------------------------------
    // AUDIO
    // --------------------------------------------------

    const audioRef = useRef<HTMLAudioElement>(null);


    // --------------------------------------------------
    // ESTADO DEL JUEGO
    // --------------------------------------------------

    const [query, setQuery] = useState("");

    const [selectedPokemon, setSelectedPokemon] =
        useState<Pokemon | null>(null);

    const [guesses, setGuesses] =
        useState<Pokemon[]>([]);

    const [error, setError] = useState("");

    const [completed, setCompleted] =
        useState(false);

    const [isLoaded, setIsLoaded] =
        useState(false);


    // --------------------------------------------------
    // CARGAR PARTIDA GUARDADA
    // --------------------------------------------------

    useEffect(() => {

        const savedGame = loadGame(gameNumber);

        if (savedGame) {

            const savedGuesses = savedGame.guesses
                .map((id) =>
                    pokemon.find((item) => item.id === id)
                )
                .filter(
                    (item): item is Pokemon =>
                        item !== undefined
                );

            setGuesses(savedGuesses);

            const hasCorrectAnswer =
                savedGuesses.some(
                    (guess) =>
                        guess.id === answer.id
                );

            setCompleted(
                savedGame.completed &&
                hasCorrectAnswer
            );
        }

        setIsLoaded(true);

    }, [gameNumber, answer.id]);


    // --------------------------------------------------
    // GUARDAR PARTIDA
    // --------------------------------------------------

    useEffect(() => {

        if (!isLoaded) {
            return;
        }

        saveGame(gameNumber, {
            guesses: guesses.map(
                (guess) => guess.id
            ),
            completed,
        });

    }, [
        guesses,
        completed,
        gameNumber,
        isLoaded,
    ]);


    // --------------------------------------------------
    // AUTOCOMPLETADO
    // --------------------------------------------------

    const suggestions = useMemo(() => {

        const search =
            query.trim().toLowerCase();

        if (!search || completed) {
            return [];
        }

        return pokemon
            .filter((item) =>
                item.name
                    .toLowerCase()
                    .startsWith(search)
            )
            .filter(
                (item) =>
                    !guesses.some(
                        (guess) =>
                            guess.id === item.id
                    )
            )
            .slice(0, 8);

    }, [
        query,
        guesses,
        completed,
    ]);


    // --------------------------------------------------
    // REPRODUCIR GRITO
    // --------------------------------------------------

    function playCry() {

        if (!audioRef.current) {
            return;
        }

        audioRef.current.currentTime = 0;

        audioRef.current
            .play()
            .catch((error) => {
                console.error(
                    "No se pudo reproducir el audio:",
                    error
                );
            });
    }


    // --------------------------------------------------
    // CAMBIO EN EL BUSCADOR
    // --------------------------------------------------

    function handleInputChange(
        value: string
    ) {

        setQuery(value);

        setSelectedPokemon(null);

        setError("");
    }


    // --------------------------------------------------
    // SELECCIONAR POKÉMON
    // --------------------------------------------------

    function handleSelect(
        item: Pokemon
    ) {

        setQuery(item.name);

        setSelectedPokemon(item);

        setError("");
    }


    // --------------------------------------------------
    // ENVIAR INTENTO
    // --------------------------------------------------

    function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {

        event.preventDefault();

        if (completed) {
            return;
        }


        // Si se seleccionó una sugerencia,
        // usamos ese Pokémon.
        // Si no, buscamos coincidencia exacta.

        const exactMatch =
            selectedPokemon ??
            pokemon.find(
                (item) =>
                    item.name.toLowerCase() ===
                    query
                        .trim()
                        .toLowerCase()
            );


        // Pokémon no válido

        if (!exactMatch) {

            setError(
                "Selecciona un Pokémon válido de cuarta generación."
            );

            return;
        }


        // Pokémon repetido

        const alreadyGuessed =
            guesses.some(
                (guess) =>
                    guess.id === exactMatch.id
            );

        if (alreadyGuessed) {

            setError(
                "Ya has probado ese Pokémon."
            );

            return;
        }


        // Añadir intento

        setGuesses(
            (currentGuesses) => [
                ...currentGuesses,
                exactMatch,
            ]
        );


        // Comprobar victoria

        if (
            exactMatch.id === answer.id
        ) {

            setCompleted(true);
        }


        // Limpiar buscador

        setQuery("");

        setSelectedPokemon(null);

        setError("");
    }


    // --------------------------------------------------
    // CARGANDO PARTIDA
    // --------------------------------------------------

    if (!isLoaded) {

        return (
            <section
                className="
          flex flex-1
          items-center
          justify-center
        "
            >
                <p
                    className="
            text-sm
            text-zinc-500
          "
                >
                    Cargando partida...
                </p>
            </section>
        );
    }


    // --------------------------------------------------
    // INTERFAZ
    // --------------------------------------------------

    return (

        <section
            className="
        flex flex-1
        flex-col
      "
        >

            {/* ============================================= */}
            {/* ZONA CENTRAL DEL JUEGO */}
            {/* ============================================= */}

            <div
                className="
          mx-auto
          w-full
          max-w-md
        "
            >

                {/* Número del reto */}

                <p
                    className="
            mb-6
            text-center
            text-sm
            font-medium
            text-zinc-500
          "
                >
                    PokeSoundle #{gameNumber}
                </p>


                {/* ============================================= */}
                {/* REPRODUCTOR */}
                {/* ============================================= */}

                <div
                    className="
            mb-10
            flex
            justify-center
          "
                >

                    <audio
                        ref={audioRef}
                        src={answer.cry}
                        preload="auto"
                    />


                    <button
                        type="button"
                        onClick={playCry}
                        className="
              flex
              h-28
              w-28
              items-center
              justify-center
              rounded-full
              bg-white
              text-4xl
              text-black
              transition
              hover:scale-105
              active:scale-95
            "
                        aria-label="Reproducir grito del Pokémon"
                    >
                        ▶
                    </button>

                </div>


                {/* ============================================= */}
                {/* JUEGO ACTIVO */}
                {/* ============================================= */}

                {!completed ? (

                    <>

                        <h2
                            className="
                mb-4
                text-center
                text-xl
                font-semibold
              "
                        >
                            ¿Qué Pokémon es?
                        </h2>


                        <form
                            onSubmit={handleSubmit}
                        >

                            {/* ===================================== */}
                            {/* BUSCADOR */}
                            {/* ===================================== */}

                            <div
                                className="
                  relative
                "
                            >

                                <input
                                    type="text"
                                    value={query}
                                    onChange={(event) =>
                                        handleInputChange(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Buscar Pokémon..."
                                    autoComplete="off"
                                    className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-700
                    bg-zinc-900
                    px-4
                    py-4
                    text-base
                    text-white
                    outline-none
                    transition
                    placeholder:text-zinc-500
                    focus:border-zinc-400
                  "
                                />


                                {/* ================================= */}
                                {/* SUGERENCIAS */}
                                {/* ================================= */}

                                {query &&
                                    !selectedPokemon &&
                                    suggestions.length > 0 && (

                                        <div
                                            className="
                        absolute
                        left-0
                        right-0
                        top-[calc(100%+0.5rem)]
                        z-20
                        max-h-80
                        overflow-y-auto
                        rounded-xl
                        border
                        border-zinc-700
                        bg-zinc-900
                        shadow-xl
                      "
                                        >

                                            {suggestions.map(
                                                (item) => (

                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelect(
                                                                item
                                                            )
                                                        }
                                                        className="
                              flex
                              w-full
                              items-center
                              justify-between
                              border-b
                              border-zinc-800
                              px-3
                              py-2
                              text-left
                              transition
                              last:border-b-0
                              hover:bg-zinc-800
                            "
                                                    >

                                                        <div
                                                            className="
                                flex
                                items-center
                                gap-3
                              "
                                                        >

                                                            {/* Sprite */}

                                                            <div
                                                                className="
                                  flex
                                  h-14
                                  w-14
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-zinc-700
                                  bg-zinc-950
                                "
                                                            >

                                                                <Image
                                                                    src={
                                                                        item.sprite
                                                                    }
                                                                    alt={
                                                                        item.name
                                                                    }
                                                                    width={56}
                                                                    height={56}
                                                                    className="
                                    [image-rendering:pixelated]
                                  "
                                                                />

                                                            </div>


                                                            {/* Nombre */}

                                                            <span
                                                                className="
                                  font-medium
                                "
                                                            >
                                {item.name}
                              </span>

                                                        </div>


                                                        {/* Número Pokédex */}

                                                        <span
                                                            className="
                                text-xs
                                text-zinc-500
                              "
                                                        >
                              #{item.id}
                            </span>

                                                    </button>

                                                )
                                            )}

                                        </div>

                                    )}

                            </div>


                            {/* ===================================== */}
                            {/* ERROR */}
                            {/* ===================================== */}

                            {error && (

                                <p
                                    className="
                    mt-3
                    text-center
                    text-sm
                    text-red-400
                  "
                                >
                                    {error}
                                </p>

                            )}


                            {/* ===================================== */}
                            {/* BOTÓN ADIVINAR */}
                            {/* ===================================== */}

                            <button
                                type="submit"
                                className="
                  mt-3
                  w-full
                  rounded-xl
                  bg-white
                  px-4
                  py-4
                  font-bold
                  text-black
                  transition
                  hover:bg-zinc-200
                  active:scale-[0.98]
                "
                            >
                                ADIVINAR
                            </button>

                        </form>

                    </>

                ) : (

                    /* ========================================= */
                    /* VICTORIA */
                    /* ========================================= */

                    <div
                        className="
              rounded-2xl
              border
              border-green-800
              bg-green-950/30
              p-6
              text-center
            "
                    >

                        <p
                            className="
                text-4xl
                text-green-400
              "
                        >
                            ✓
                        </p>


                        <h2
                            className="
                mt-3
                text-2xl
                font-bold
              "
                        >
                            ¡Correcto!
                        </h2>


                        <p
                            className="
                mt-4
                text-3xl
                font-black
              "
                        >
                            {answer.name}
                        </p>


                        {/* Sprite de la respuesta */}

                        <Image
                            src={answer.sprite}
                            alt={`Sprite de ${answer.name}`}
                            width={160}
                            height={160}
                            className="
                mx-auto
                mt-4
                [image-rendering:pixelated]
              "
                        />


                        <p
                            className="
                mt-1
                text-sm
                text-zinc-500
              "
                        >
                            #{answer.id}
                        </p>


                        <p
                            className="
                mt-5
                text-zinc-300
              "
                        >
                            Lo has acertado en{" "}

                            <strong>
                                {guesses.length}{" "}
                                {guesses.length === 1
                                    ? "intento"
                                    : "intentos"}
                            </strong>

                        </p>
                        <NextPokemonCountdown />

                    </div>

                )}

            </div>


            {/* ============================================= */}
            {/* HISTORIAL DE INTENTOS */}
            {/* ============================================= */}

            <div
                className="
          mt-10
          w-full
        "
            >

                <p
                    className="
            mb-5
            text-center
            text-sm
            text-zinc-500
          "
                >
                    Intentos: {guesses.length}
                </p>


                {guesses.length > 0 && (

                    <div
                        className="
              overflow-x-auto
              pb-3
            "
                    >

                        <div
                            className="
                mx-auto
                min-w-[720px]
                max-w-4xl
              "
                        >

                            {/* ===================================== */}
                            {/* CABECERAS */}
                            {/* ===================================== */}

                            <div
                                className="
                  mb-2
                  grid
                  grid-cols-7
                  gap-2
                  text-center
                  text-xs
                  font-semibold
                  text-zinc-500
                "
                            >

                <span>
                  Pokémon
                </span>

                                <span>
                  Tipo 1
                </span>

                                <span>
                  Tipo 2
                </span>

                                <span>
                  Color
                </span>

                                <span>
                  Etapa
                </span>

                                <span>
                  Altura
                </span>

                                <span>
                  Peso
                </span>

                            </div>


                            {/* ===================================== */}
                            {/* FILAS */}
                            {/* ===================================== */}

                            <div
                                className="
                  space-y-2
                "
                            >

                                {[...guesses].reverse().map(
                                    (guess) => {

                                        // -------------------------------
                                        // ETAPA EVOLUTIVA
                                        // -------------------------------

                                        const evolutionDirection:
                                            | "up"
                                            | "down"
                                            | undefined =
                                            guess.evolutionStage <
                                            answer.evolutionStage
                                                ? "up"
                                                : guess.evolutionStage >
                                                answer.evolutionStage
                                                    ? "down"
                                                    : undefined;


                                        // -------------------------------
                                        // ALTURA
                                        // -------------------------------

                                        const heightDirection:
                                            | "up"
                                            | "down"
                                            | undefined =
                                            guess.height <
                                            answer.height
                                                ? "up"
                                                : guess.height >
                                                answer.height
                                                    ? "down"
                                                    : undefined;


                                        // -------------------------------
                                        // PESO
                                        // -------------------------------

                                        const weightDirection:
                                            | "up"
                                            | "down"
                                            | undefined =
                                            guess.weight <
                                            answer.weight
                                                ? "up"
                                                : guess.weight >
                                                answer.weight
                                                    ? "down"
                                                    : undefined;


                                        return (

                                            <div
                                                key={guess.id}
                                                className="
                          grid
                          grid-cols-7
                          gap-2
                        "
                                            >

                                                {/* ========================= */}
                                                {/* POKÉMON */}
                                                {/* ========================= */}

                                                <div
                                                    className={`
                            flex
                            h-20
                            min-w-20
                            items-center
                            justify-center
                            rounded-lg
                            border-2
                            bg-zinc-100

                            ${
                                                        guess.id ===
                                                        answer.id
                                                            ? "border-green-500"
                                                            : "border-red-500"
                                                    }
                          `}
                                                >

                                                    <Image
                                                        src={
                                                            guess.sprite
                                                        }
                                                        alt={
                                                            guess.name
                                                        }
                                                        width={72}
                                                        height={72}
                                                        className="
                              [image-rendering:pixelated]
                            "
                                                    />

                                                </div>


                                                {/* TIPO 1 */}

                                                <GuessCell
                                                    label={getTypeName(guess.type1)}
                                                    correct={
                                                        guess.type1 === answer.type1
                                                    }
                                                    partial={
                                                        guess.type1 !== answer.type1 &&
                                                        guess.type1 === answer.type2
                                                    }
                                                />


                                                {/* TIPO 2 */}

                                                <GuessCell
                                                    label={getTypeName(guess.type2)}
                                                    correct={
                                                        guess.type2 === answer.type2
                                                    }
                                                    partial={
                                                        guess.type2 !== null &&
                                                        guess.type2 !== answer.type2 &&
                                                        guess.type2 === answer.type1
                                                    }
                                                />


                                                {/* ========================= */}
                                                {/* COLOR */}
                                                {/* ========================= */}

                                                <GuessCell
                                                    label={
                                                        getColorName(
                                                            guess.color
                                                        )
                                                    }
                                                    correct={
                                                        guess.color ===
                                                        answer.color
                                                    }
                                                />


                                                {/* ========================= */}
                                                {/* ETAPA EVOLUTIVA */}
                                                {/* ========================= */}

                                                <GuessCell
                                                    label={
                                                        String(
                                                            guess.evolutionStage
                                                        )
                                                    }
                                                    correct={
                                                        guess.evolutionStage ===
                                                        answer.evolutionStage
                                                    }
                                                    direction={
                                                        evolutionDirection
                                                    }
                                                />


                                                {/* ========================= */}
                                                {/* ALTURA */}
                                                {/* ========================= */}

                                                <GuessCell
                                                    label={`${guess.height.toFixed(
                                                        1
                                                    )} m`}
                                                    correct={
                                                        guess.height ===
                                                        answer.height
                                                    }
                                                    direction={
                                                        heightDirection
                                                    }
                                                />


                                                {/* ========================= */}
                                                {/* PESO */}
                                                {/* ========================= */}

                                                <GuessCell
                                                    label={`${guess.weight.toFixed(
                                                        1
                                                    )} kg`}
                                                    correct={
                                                        guess.weight ===
                                                        answer.weight
                                                    }
                                                    direction={
                                                        weightDirection
                                                    }
                                                />

                                            </div>

                                        );
                                    }
                                )}

                            </div>

                        </div>

                    </div>

                )}

            </div>

        </section>
    );
}