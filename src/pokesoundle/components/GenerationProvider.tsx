"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

import {
    DEFAULT_GENERATION,
    generations,
    type GenerationId,
} from "@/data/generations";

type GenerationContextValue = {
    generation: GenerationId;
    setGeneration: (
        generation: GenerationId
    ) => void;
};

const GenerationContext =
    createContext<GenerationContextValue | null>(
        null
    );

const STORAGE_KEY =
    "pokesoundle-generation";

export default function GenerationProvider({
                                               children,
                                           }: {
    children: ReactNode;
}) {
    const [
        generation,
        setGenerationState,
    ] =
        useState<GenerationId>(
            DEFAULT_GENERATION
        );

    useEffect(() => {
        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {
            return;
        }

        const parsed =
            Number(saved) as GenerationId;

        const validGeneration =
            generations.find(
                (item) =>
                    item.id === parsed &&
                    item.enabled
            );

        if (validGeneration) {
            setGenerationState(parsed);
        }
    }, []);

    function setGeneration(
        newGeneration: GenerationId
    ) {
        const available =
            generations.some(
                (item) =>
                    item.id === newGeneration &&
                    item.enabled
            );

        if (!available) {
            return;
        }

        setGenerationState(
            newGeneration
        );

        localStorage.setItem(
            STORAGE_KEY,
            String(newGeneration)
        );
    }

    return (
        <GenerationContext.Provider
            value={{
                generation,
                setGeneration,
            }}
        >
            {children}
        </GenerationContext.Provider>
    );
}

export function useGeneration() {
    const context =
        useContext(GenerationContext);

    if (!context) {
        throw new Error(
            "useGeneration debe utilizarse dentro de GenerationProvider."
        );
    }

    return context;
}