"use client";

import Image from "next/image";

import {
  type FormEvent,
  useEffect,
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

import GuessCell from "@/components/GuessCell";
import DailyLeaderboard from "@/components/DailyLeaderboard";
import NextPokemonCountdown from "@/components/NextPokemonCountdown";

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


export default function PokeSoundleGame() {

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


  const generationPokemon =
      useMemo(
          () =>
              getPokemonByGeneration(
                  generation
              ),
          [generation]
      );


  // ==================================================
  // RETO DIARIO
  // ==================================================

  const gameNumber =
      getPokeSoundleNumber(
          generation
      );


  const answer =
      getDailyPokemon(
          generation
      );


  /*
   * Nos permite saber exactamente qué partida
   * está cargada en memoria.
   *
   * Ejemplos:
   *
   * 4-2 -> Gen IV, PokeSoundle #2
   * 1-7 -> Gen I, PokeSoundle #7
   */
  const currentGameKey =
      `${generation}-${gameNumber}`;


  // ==================================================
  // ESTADO
  // ==================================================

  const [
    query,
    setQuery,
  ] =
      useState("");


  const [
    selectedPokemon,
    setSelectedPokemon,
  ] =
      useState<Pokemon | null>(
          null
      );


  const [
    guesses,
    setGuesses,
  ] =
      useState<Pokemon[]>([]);


  const [
    completed,
    setCompleted,
  ] =
      useState(false);


  const [
    error,
    setError,
  ] =
      useState("");


  /*
   * Pokémon correspondiente al último intento.
   * Se utiliza para animar solamente la fila nueva.
   */
  const [
    latestGuessId,
    setLatestGuessId,
  ] =
      useState<number | null>(
          null
      );


  /*
   * Partida que ya ha sido cargada desde localStorage.
   *
   * Esto evita guardar accidentalmente los intentos
   * de una generación dentro de otra al cambiar
   * el selector.
   */
  const [
    loadedGameKey,
    setLoadedGameKey,
  ] =
      useState<string | null>(
          null
      );


  const audioRef =
      useRef<HTMLAudioElement>(
          null
      );


  // ==================================================
  // CARGAR PARTIDA
  // ==================================================

  useEffect(() => {

    /*
     * Marcamos temporalmente que todavía no tenemos
     * cargada la nueva partida.
     */
    setLoadedGameKey(
        null
    );


    const savedGame =
        loadGame(
            generation,
            gameNumber
        );


    let loadedGuesses:
        Pokemon[] = [];


    let loadedCompleted =
        false;


    if (savedGame) {

      loadedGuesses =
          savedGame.guesses
              .map((id) =>
                  generationPokemon.find(
                      (item) =>
                          item.id === id
                  )
              )
              .filter(
                  (
                      item
                  ): item is Pokemon =>
                      item !== undefined
              );


      /*
       * No confiamos únicamente en "completed".
       *
       * Comprobamos que realmente exista el Pokémon
       * correcto entre los intentos guardados.
       */
      loadedCompleted =
          savedGame.completed &&
          loadedGuesses.some(
              (guess) =>
                  guess.id ===
                  answer.id
          );
    }


    setGuesses(
        loadedGuesses
    );

    setCompleted(
        loadedCompleted
    );

    setQuery("");

    setSelectedPokemon(
        null
    );

    setError("");

    setLatestGuessId(
        null
    );


    /*
     * A partir de aquí ya podemos permitir
     * que el efecto de guardado funcione.
     */
    setLoadedGameKey(
        currentGameKey
    );

  }, [
    generation,
    gameNumber,
    answer.id,
    generationPokemon,
    currentGameKey,
  ]);


  // ==================================================
  // GUARDAR PARTIDA
  // ==================================================

  useEffect(() => {

    /*
     * Si acabamos de cambiar de generación y aún
     * no hemos cargado su partida, no guardamos nada.
     */
    if (
        loadedGameKey !==
        currentGameKey
    ) {
      return;
    }


    saveGame(
        generation,
        gameNumber,
        {
          guesses:
              guesses.map(
                  (guess) =>
                      guess.id
              ),

          completed,
        }
    );

  }, [
    generation,
    gameNumber,
    guesses,
    completed,
    loadedGameKey,
    currentGameKey,
  ]);


  // ==================================================
  // AUTOCOMPLETADO
  // ==================================================

  const suggestions =
      useMemo(() => {

        const search =
            query
                .trim()
                .toLowerCase();


        if (
            !search ||
            completed
        ) {
          return [];
        }


        return generationPokemon

            /*
             * Solo nombres que EMPIECEN por lo escrito.
             *
             * "lu":
             * Luxio
             * Luxray
             * Lucario
             * Lumineon
             */
            .filter(
                (item) =>
                    item.name
                        .toLowerCase()
                        .startsWith(
                            search
                        )
            )

            /*
             * No mostramos Pokémon que ya hayan
             * sido utilizados.
             */
            .filter(
                (item) =>
                    !guesses.some(
                        (guess) =>
                            guess.id ===
                            item.id
                    )
            )

            .slice(
                0,
                8
            );

      }, [
        query,
        guesses,
        completed,
        generationPokemon,
      ]);


  // ==================================================
  // REPRODUCIR CRY
  // ==================================================

  function playCry() {

    if (
        !audioRef.current
    ) {
      return;
    }


    audioRef.current.currentTime =
        0;


    audioRef.current
        .play()
        .catch(
            (playError) => {
              console.error(
                  "No se pudo reproducir el audio:",
                  playError
              );
            }
        );
  }


  // ==================================================
  // BUSCADOR
  // ==================================================

  function handleInputChange(
      value: string
  ) {

    setQuery(
        value
    );

    setSelectedPokemon(
        null
    );

    setError("");
  }


  function handleSelectPokemon(
      item: Pokemon
  ) {

    setQuery(
        item.name
    );

    setSelectedPokemon(
        item
    );

    setError("");
  }


  // ==================================================
  // ENVIAR INTENTO
  // ==================================================

  function handleSubmit(
      event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (completed) {
      return;
    }


    /*
     * Puede haber sido seleccionado desde el
     * autocompletado o escrito manualmente.
     */
    const exactMatch =
        selectedPokemon ??
        generationPokemon.find(
            (item) =>
                item.name
                    .toLowerCase() ===
                query
                    .trim()
                    .toLowerCase()
        );


    if (!exactMatch) {

      setError(
          `Selecciona un Pokémon válido de ${generationConfig.label}.`
      );

      return;
    }


    /*
     * Evitamos intentos repetidos.
     */
    if (
        guesses.some(
            (guess) =>
                guess.id ===
                exactMatch.id
        )
    ) {

      setError(
          "Ya has probado ese Pokémon."
      );

      return;
    }


    setLatestGuessId(
        exactMatch.id
    );


    setGuesses(
        (currentGuesses) => [
          ...currentGuesses,
          exactMatch,
        ]
    );


    if (
        exactMatch.id ===
        answer.id
    ) {
      setCompleted(
          true
      );
    }


    setQuery("");

    setSelectedPokemon(
        null
    );

    setError("");
  }


  // ==================================================
  // CAMBIO DE GENERACIÓN / CARGANDO
  // ==================================================

  /*
   * Evita que al cambiar de generación se vea durante
   * unas décimas la partida de la generación anterior.
   *
   * También evita que DailyLeaderboard pueda montarse
   * accidentalmente con los intentos antiguos.
   */
  if (
      loadedGameKey !==
      currentGameKey
  ) {
    return (
        <div
            className="
          py-20
          text-center
          text-sm
          font-semibold
          text-zinc-500
        "
        >
          Cargando reto...
        </div>
    );
  }


  // ==================================================
  // INTERFAZ
  // ==================================================

  return (
      <section
          className="
        flex
        flex-col
      "
      >

        {/* ============================================== */}
        {/* INFORMACIÓN DEL RETO */}
        {/* ============================================== */}

        <div
            className="
          mb-6
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


          <p
              className="
            mt-1
            text-sm
            font-semibold
            text-zinc-500
          "
          >
            PokeSoundle #{gameNumber}
          </p>

        </div>


        {/* ============================================== */}
        {/* JUEGO */}
        {/* ============================================== */}

        <div
            className="
          mx-auto
          w-full
          max-w-md
        "
        >

          {/* ============================================ */}
          {/* AUDIO */}
          {/* ============================================ */}

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
                className="pokeball-button"
                aria-label="Reproducir grito del Pokémon"
            >
            <span
                className="pokeball-center"
            >
              <span
                  className="pokeball-play"
              >
                ▶
              </span>
            </span>
            </button>

          </div>


          {/* ============================================ */}
          {/* BUSCADOR */}
          {/* ============================================ */}

          {!completed && (
              <>

                <h2
                    className="
                mb-4
                text-center
                text-xl
                font-semibold
                text-zinc-900
              "
                >
                  ¿Qué Pokémon es?
                </h2>


                <form
                    onSubmit={
                      handleSubmit
                    }
                >

                  <div
                      className="
                  relative
                "
                  >

                    <input
                        type="text"
                        value={query}
                        onChange={(
                            event
                        ) =>
                            handleInputChange(
                                event
                                    .target
                                    .value
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
                    focus:border-blue-400
                  "
                    />


                    {/* ==================================== */}
                    {/* SUGERENCIAS */}
                    {/* ==================================== */}

                    {query &&
                        !selectedPokemon &&
                        suggestions.length >
                        0 && (

                            <div
                                className="
                        absolute
                        left-0
                        right-0
                        top-[calc(100%+0.5rem)]
                        z-30
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
                                          key={
                                            item.id
                                          }
                                          type="button"
                                          onClick={() =>
                                              handleSelectPokemon(
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
                              text-white
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


                                          <span
                                              className="
                                  font-medium
                                  text-white
                                "
                                          >
                                {item.name}
                              </span>

                                        </div>


                                        <span
                                            className="
                                text-xs
                                text-zinc-400
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


                  {/* ERROR */}

                  {error && (

                      <p
                          className="
                    mt-3
                    text-center
                    text-sm
                    font-semibold
                    text-red-600
                  "
                      >
                        {error}
                      </p>

                  )}


                  {/* BOTÓN */}

                  <button
                      type="submit"
                      className="
                  mt-3
                  w-full
                  rounded-xl
                  border-2
                  border-zinc-950
                  bg-yellow-400
                  px-4
                  py-4
                  font-black
                  text-zinc-950
                  shadow-[0_4px_0_#18181b]
                  transition
                  hover:bg-yellow-300
                  active:translate-y-1
                  active:shadow-none
                "
                  >
                    ADIVINAR
                  </button>

                </form>

              </>
          )}


          {/* ============================================ */}
          {/* VICTORIA */}
          {/* ============================================ */}

          {completed && (

              <div
                  className="
              rounded-2xl
              border-2
              border-green-700
              bg-green-50
              p-6
              text-center
            "
              >

                <p
                    className="
                text-4xl
                text-green-600
              "
                >
                  ✓
                </p>


                <h2
                    className="
                mt-3
                text-2xl
                font-black
              "
                >
                  ¡Correcto!
                </h2>


                <p
                    className="
                mt-3
                text-3xl
                font-black
              "
                >
                  {answer.name}
                </p>


                <Image
                    src={
                      answer.sprite
                    }
                    alt={
                      answer.name
                    }
                    width={160}
                    height={160}
                    className="
                mx-auto
                mt-3
                [image-rendering:pixelated]
              "
                />


                <p
                    className="
                text-sm
                text-zinc-500
              "
                >
                  #{answer.id}
                </p>


                <p
                    className="
                mt-4
                text-zinc-700
              "
                >
                  Lo has acertado en{" "}

                  <strong>
                    {guesses.length}{" "}
                    {guesses.length ===
                    1
                        ? "intento"
                        : "intentos"}
                  </strong>
                </p>


                {/* LEADERBOARD */}

                <div
                    className="
                mt-8
              "
                >
                  <DailyLeaderboard
                      generation={
                        generation
                      }
                      gameNumber={
                        gameNumber
                      }
                      attempts={
                        guesses.length
                      }
                  />
                </div>


                {/* CUENTA ATRÁS */}

                <div
                    className="
                mt-6
              "
                >
                  <NextPokemonCountdown />
                </div>

              </div>

          )}

        </div>


        {/* ============================================== */}
        {/* INTENTOS */}
        {/* ============================================== */}

        <div
            className="
          mt-10
          w-full
        "
        >

          <p
              className="
            mb-4
            text-center
            text-sm
            text-zinc-500
          "
          >
            Intentos: {guesses.length}
          </p>


          {guesses.length >
              0 && (
                  <>

                    {/* AVISO MÓVIL */}

                    <p
                        className="
                mb-3
                text-center
                text-xs
                font-semibold
                text-zinc-500
                sm:hidden
              "
                    >
                      ← Desliza para ver todas las pistas →
                    </p>


                    <div
                        className="
                overflow-x-auto
                pb-3
              "
                    >

                      <div
                          className="
                  mx-auto
                  min-w-[590px]
                  max-w-4xl
                  sm:min-w-[720px]
                "
                      >

                        {/* ==================================== */}
                        {/* CABECERA */}
                        {/* ==================================== */}

                        <div
                            className="
                    mb-2
                    grid
                    grid-cols-7
                    gap-2
                    text-center
                    text-xs
                    font-bold
                    text-zinc-600
                  "
                        >

                  <span
                      className="
                      sticky
                      left-0
                      z-20
                      bg-zinc-100
                      sm:static
                    "
                  >
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


                        {/* ==================================== */}
                        {/* FILAS */}
                        {/* ==================================== */}

                        <div
                            className="
                    space-y-2
                  "
                        >

                          {[...guesses]
                              .reverse()
                              .map(
                                  (guess) => {

                                    /*
                                     * Solamente el último intento
                                     * recibe la animación.
                                     */
                                    const isLatest =
                                        guess.id ===
                                        latestGuessId;


                                    // ==============================
                                    // DIRECCIONES
                                    // ==============================

                                    const evolutionDirection:
                                        | "up"
                                        | "down"
                                        | undefined =
                                        guess
                                            .evolutionStage <
                                        answer
                                            .evolutionStage
                                            ? "up"
                                            : guess
                                                .evolutionStage >
                                            answer
                                                .evolutionStage
                                                ? "down"
                                                : undefined;


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


                                    /*
                                     * Animación escalonada:
                                     *
                                     * sprite -> 0ms
                                     * tipo 1 -> 80ms
                                     * tipo 2 -> 160ms
                                     * ...
                                     */
                                    function animation(
                                        delay:
                                        number
                                    ) {

                                      if (
                                          !isLatest
                                      ) {
                                        return {};
                                      }


                                      return {
                                        className:
                                            "guess-flip",

                                        style: {
                                          animationDelay:
                                              `${delay}ms`,
                                        },
                                      };
                                    }


                                    return (

                                        <div
                                            key={
                                              guess.id
                                            }
                                            className="
                              grid
                              grid-cols-7
                              gap-2
                            "
                                        >

                                          {/* ======================== */}
                                          {/* SPRITE */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  0
                                              )}
                                              className={`
                                ${animation(0).className ?? ""}
                                sticky
                                left-0
                                z-10
                                bg-zinc-100
                                sm:static
                              `}
                                          >

                                            <div
                                                className={`
                                  flex
                                  h-16
                                  min-w-16
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border-2
                                  bg-zinc-100

                                  sm:h-20
                                  sm:min-w-20

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

                                          </div>


                                          {/* ======================== */}
                                          {/* TIPO 1 */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  80
                                              )}
                                          >

                                            <GuessCell
                                                label={
                                                  getTypeName(
                                                      guess.type1
                                                  )
                                                }
                                                correct={
                                                    guess.type1 ===
                                                    answer.type1
                                                }
                                                partial={
                                                    guess.type1 !==
                                                    answer.type1 &&
                                                    guess.type1 ===
                                                    answer.type2
                                                }
                                            />

                                          </div>


                                          {/* ======================== */}
                                          {/* TIPO 2 */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  160
                                              )}
                                          >

                                            <GuessCell
                                                label={
                                                  getTypeName(
                                                      guess.type2
                                                  )
                                                }
                                                correct={
                                                    guess.type2 ===
                                                    answer.type2
                                                }
                                                partial={
                                                    guess.type2 !==
                                                    null &&
                                                    guess.type2 !==
                                                    answer.type2 &&
                                                    guess.type2 ===
                                                    answer.type1
                                                }
                                            />

                                          </div>


                                          {/* ======================== */}
                                          {/* COLOR */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  240
                                              )}
                                          >

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

                                          </div>


                                          {/* ======================== */}
                                          {/* EVOLUCIÓN */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  320
                                              )}
                                          >

                                            <GuessCell
                                                label={
                                                  String(
                                                      guess
                                                          .evolutionStage
                                                  )
                                                }
                                                correct={
                                                    guess
                                                        .evolutionStage ===
                                                    answer
                                                        .evolutionStage
                                                }
                                                direction={
                                                  evolutionDirection
                                                }
                                            />

                                          </div>


                                          {/* ======================== */}
                                          {/* ALTURA */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  400
                                              )}
                                          >

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

                                          </div>


                                          {/* ======================== */}
                                          {/* PESO */}
                                          {/* ======================== */}

                                          <div
                                              {...animation(
                                                  480
                                              )}
                                          >

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

                                        </div>

                                    );
                                  }
                              )}

                        </div>

                      </div>

                    </div>

                  </>
              )}

        </div>

      </section>
  );
}