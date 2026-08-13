import {
    supabase,
} from "@/lib/supabase";

import type {
    GenerationId,
} from "@/data/generations";


export type LeaderboardEntry = {
    id: number;
    nickname: string;
    attempts: number;
    created_at: string;
};


async function ensureAnonymousUser() {
    const {
        data: {
            session,
        },
        error: sessionError,
    } =
        await supabase.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (session?.user) {
        return session.user;
    }


    const {
        data,
        error,
    } =
        await supabase.auth.signInAnonymously();

    if (error) {
        throw error;
    }

    if (!data.user) {
        throw new Error(
            "No se pudo crear el usuario anónimo."
        );
    }

    return data.user;
}


export async function getMyScore(
    generation: GenerationId,
    gameNumber: number
): Promise<LeaderboardEntry | null> {

    const user =
        await ensureAnonymousUser();

    const {
        data,
        error,
    } =
        await supabase
            .from(
                "daily_leaderboard"
            )
            .select(
                "id, nickname, attempts, created_at"
            )
            .eq(
                "generation",
                generation
            )
            .eq(
                "game_number",
                gameNumber
            )
            .eq(
                "user_id",
                user.id
            )
            .maybeSingle();


    if (error) {
        throw error;
    }

    return data;
}


export async function submitScore(
    generation: GenerationId,
    gameNumber: number,
    nickname: string,
    attempts: number
): Promise<LeaderboardEntry> {

    const user =
        await ensureAnonymousUser();

    const cleanNickname =
        nickname
            .trim()
            .replace(
                /\s+/g,
                " "
            );


    if (
        cleanNickname.length < 2 ||
        cleanNickname.length > 20
    ) {
        throw new Error(
            "El nickname debe tener entre 2 y 20 caracteres."
        );
    }


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "daily_leaderboard"
            )
            .insert({
                user_id:
                user.id,

                generation,

                game_number:
                gameNumber,

                nickname:
                cleanNickname,

                attempts,
            })
            .select(
                "id, nickname, attempts, created_at"
            )
            .single();


    if (error) {

        if (
            error.code === "23505"
        ) {
            const existing =
                await getMyScore(
                    generation,
                    gameNumber
                );

            if (existing) {
                return existing;
            }
        }

        throw error;
    }


    return data;
}


export async function getLeaderboard(
    generation: GenerationId,
    gameNumber: number
): Promise<
    LeaderboardEntry[]
> {

    await ensureAnonymousUser();


    const {
        data,
        error,
    } =
        await supabase
            .from(
                "daily_leaderboard"
            )
            .select(
                "id, nickname, attempts, created_at"
            )
            .eq(
                "generation",
                generation
            )
            .eq(
                "game_number",
                gameNumber
            )
            .order(
                "attempts",
                {
                    ascending: true,
                }
            )
            .order(
                "created_at",
                {
                    ascending: true,
                }
            )
            .limit(100);


    if (error) {
        throw error;
    }

    return data ?? [];
}