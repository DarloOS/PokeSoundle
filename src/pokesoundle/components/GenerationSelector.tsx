"use client";

import {
    getEnabledGenerations,
    type GenerationId,
} from "@/data/generations";

import {
    useGeneration,
} from "@/components/GenerationProvider";

export default function GenerationSelector() {
    const {
        generation,
        setGeneration,
    } = useGeneration();

    const availableGenerations =
        getEnabledGenerations();

    return (
        <select
            value={generation}
            onChange={(event) =>
                setGeneration(
                    Number(
                        event.target.value
                    ) as GenerationId
                )
            }
            aria-label="Seleccionar generación"
            className="
        rounded-xl
        border-2
        border-zinc-950
        bg-white
        px-3 py-2
        text-sm
        font-black
        text-zinc-950
        outline-none
        transition
        hover:bg-zinc-100
        focus:border-yellow-400
      "
        >
            {availableGenerations.map(
                (item) => (
                    <option
                        key={item.id}
                        value={item.id}
                    >
                        {item.label} · {item.region}
                    </option>
                )
            )}
        </select>
    );
}