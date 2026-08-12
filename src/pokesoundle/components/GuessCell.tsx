type GuessCellProps = {
    label: string;
    correct: boolean;
    partial?: boolean;
    direction?: "up" | "down";
};

export default function GuessCell({
                                      label,
                                      correct,
                                      partial = false,
                                      direction,
                                  }: GuessCellProps) {
    let colorClasses =
        "border-red-500 bg-red-700 text-white";

    if (partial) {
        colorClasses =
            "border-yellow-400 bg-yellow-500 text-black";
    }

    if (correct) {
        colorClasses =
            "border-green-500 bg-green-600 text-white";
    }

    return (
        <div
            className={`
        relative
        flex
        h-20
        min-w-20
        items-center
        justify-center
        rounded-lg
        border-2
        px-2
        text-center
        text-sm
        font-bold
        ${colorClasses}
      `}
        >
            {label}

            {!correct && !partial && direction && (
                <span className="absolute right-1 top-0 text-xl">
          {direction === "up" ? "↑" : "↓"}
        </span>
            )}
        </div>
    );
}