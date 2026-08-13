"use client";

import type { FormEvent } from "react";
import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    getLeaderboard,
    getMyScore,
    submitScore,
    type LeaderboardEntry,
} from "@/lib/leaderboard";

import type {
    GenerationId,
} from "@/data/generations";

type DailyLeaderboardProps = {
    generation: GenerationId;
    gameNumber: number;
    attempts: number;
};

export default function DailyLeaderboard({
                                             generation,
                                             gameNumber,
                                             attempts,
                                         }: DailyLeaderboardProps) {
    const [nickname, setNickname] =
        useState("");

    const [myEntry, setMyEntry] =
        useState<LeaderboardEntry | null>(null);

    const [entries, setEntries] =
        useState<LeaderboardEntry[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    // --------------------------------------------------
    // CARGAR RESULTADO PROPIO
    // --------------------------------------------------

    const loadInitialState =
        useCallback(async () => {
            try {
                setLoading(true);
                setError("");

                const existing =
                    await getMyScore(generation, gameNumber);

                setMyEntry(existing);

                // Solo mostramos el leaderboard
                // después de haber enviado el resultado.
                if (existing) {
                    const leaderboard =
                        await getLeaderboard(generation, gameNumber);

                    setEntries(leaderboard);
                }
            } catch (error) {
                console.error(error);

                setError(
                    "No se pudo conectar con el leaderboard."
                );
            } finally {
                setLoading(false);
            }
        }, [gameNumber]);

    useEffect(() => {
        void loadInitialState();
    }, [loadInitialState]);

    // --------------------------------------------------
    // REFRESCAR LEADERBOARD
    // --------------------------------------------------

    async function refreshLeaderboard() {
        try {
            setError("");

            const leaderboard =
                await getLeaderboard(generation, gameNumber);

            setEntries(leaderboard);
        } catch (error) {
            console.error(error);

            setError(
                "No se pudo actualizar el leaderboard."
            );
        }
    }

    // --------------------------------------------------
    // ENVIAR NICKNAME
    // --------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        if (submitting) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            const entry = await submitScore(
                generation,
                gameNumber,
                nickname,
                attempts
            );

            setMyEntry(entry);

            const leaderboard =
                await getLeaderboard(generation, gameNumber);

            setEntries(leaderboard);
        } catch (error) {
            console.error(error);

            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(
                    "No se pudo guardar el resultado."
                );
            }
        } finally {
            setSubmitting(false);
        }
    }

    // --------------------------------------------------
    // POSICIÓN DEL JUGADOR
    // --------------------------------------------------

    const myPosition =
        myEntry !== null
            ? entries.findIndex(
            (entry) =>
                entry.id === myEntry.id
        ) + 1
            : 0;

    // --------------------------------------------------
    // CARGANDO
    // --------------------------------------------------

    if (loading) {
        return (
            <div className="mt-6 border-t border-green-200 pt-5">
                <p className="text-sm text-zinc-500">
                    Cargando leaderboard...
                </p>
            </div>
        );
    }

    // --------------------------------------------------
    // NICKNAME
    // --------------------------------------------------

    if (!myEntry) {
        return (
            <div className="mt-6 border-t border-green-200 pt-5">

                <h3 className="text-lg font-black text-zinc-950">
                    Entra en el leaderboard
                </h3>

                <p className="mt-1 text-sm text-zinc-600">
                    Elige un nickname para guardar
                    tus {attempts}{" "}
                    {attempts === 1
                        ? "intento"
                        : "intentos"}.
                </p>

                <form
                    onSubmit={handleSubmit}
                    className="mt-4"
                >
                    <input
                        type="text"
                        value={nickname}
                        onChange={(event) => {
                            setNickname(
                                event.target.value
                            );

                            setError("");
                        }}
                        minLength={2}
                        maxLength={20}
                        placeholder="Tu nickname"
                        autoComplete="nickname"
                        className="
              w-full
              rounded-xl
              border-2
              border-zinc-400
              bg-white
              px-4
              py-3
              text-center
              font-bold
              text-zinc-950
              outline-none
              transition
              placeholder:text-zinc-400
              focus:border-blue-600
            "
                    />

                    <p className="mt-1 text-xs text-zinc-400">
                        {nickname.trim().length}/20
                    </p>

                    {error && (
                        <p className="mt-2 text-sm font-semibold text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={
                            submitting ||
                            nickname.trim().length < 2
                        }
                        className="
              mt-3
              w-full
              rounded-xl
              border-2
              border-zinc-950
              bg-yellow-400
              px-4
              py-3
              font-black
              text-zinc-950
              shadow-[0_4px_0_#18181b]
              transition
              hover:bg-yellow-300
              active:translate-y-1
              active:shadow-none
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                    >
                        {submitting
                            ? "GUARDANDO..."
                            : "ENTRAR AL LEADERBOARD"}
                    </button>

                </form>

            </div>
        );
    }

    // --------------------------------------------------
    // LEADERBOARD
    // --------------------------------------------------

    return (
        <div className="mt-6 border-t border-green-200 pt-5">

            <div className="flex items-center justify-between gap-3">

                <div className="text-left">
                    <h3 className="text-lg font-black text-zinc-950">
                        Leaderboard de hoy
                    </h3>

                    {myPosition > 0 && (
                        <p className="text-xs text-zinc-500">
                            Tu posición: #{myPosition}
                        </p>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() =>
                        void refreshLeaderboard()
                    }
                    className="
            rounded-lg
            border-2
            border-zinc-300
            bg-white
            px-3
            py-2
            text-xs
            font-bold
            text-zinc-700
            transition
            hover:bg-zinc-100
          "
                >
                    Actualizar
                </button>

            </div>

            {error && (
                <p className="mt-3 text-sm font-semibold text-red-600">
                    {error}
                </p>
            )}

            <div
                className="
          mt-4
          max-h-80
          overflow-y-auto
          rounded-xl
          border-2
          border-zinc-300
          bg-white
        "
            >

                {/* Cabecera */}

                <div
                    className="
            sticky
            top-0
            grid
            grid-cols-[50px_1fr_80px]
            border-b-2
            border-zinc-300
            bg-zinc-100
            px-3
            py-2
            text-xs
            font-black
            uppercase
            text-zinc-500
          "
                >
                    <span>#</span>

                    <span className="text-left">
            Jugador
          </span>

                    <span>
            Intentos
          </span>
                </div>

                {/* Resultados */}

                {entries.map(
                    (entry, index) => {
                        const isMe =
                            entry.id === myEntry.id;

                        return (
                            <div
                                key={entry.id}
                                className={`
                  grid
                  grid-cols-[50px_1fr_80px]
                  items-center
                  border-b
                  border-zinc-200
                  px-3
                  py-3
                  text-sm
                  last:border-b-0

                  ${
                                    isMe
                                        ? "bg-yellow-100 font-black"
                                        : "bg-white"
                                }
                `}
                            >

                <span
                    className="
                    text-left
                    font-black
                    text-zinc-500
                  "
                >
                  {index + 1}
                </span>

                                <span
                                    className="
                    truncate
                    text-left
                    text-zinc-950
                  "
                                >
                  {entry.nickname}

                                    {isMe && (
                                        <span className="ml-2 text-xs text-blue-600">
                      Tú
                    </span>
                                    )}
                </span>

                                <span className="font-black text-zinc-950">
                  {entry.attempts}
                </span>

                            </div>
                        );
                    }
                )}

                {entries.length === 0 && (
                    <p className="p-5 text-sm text-zinc-500">
                        Todavía no hay resultados.
                    </p>
                )}

            </div>

            <p className="mt-2 text-xs text-zinc-400">
                El leaderboard se reinicia con
                el siguiente PokeSoundle.
            </p>

        </div>
    );
}