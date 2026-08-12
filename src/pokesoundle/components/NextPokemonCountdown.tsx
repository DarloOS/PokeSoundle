"use client";

import { useEffect, useState } from "react";

function getTimeUntilNextMadridDay() {
  const now = new Date();

  const madridDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [year, month, day] = madridDate.split("-").map(Number);

  // Construimos el próximo día y buscamos cuándo son
  // las 00:00 de Madrid aproximadamente mediante Intl.
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));

  const madridOffsetFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Madrid",
    timeZoneName: "longOffset",
  });

  const parts = madridOffsetFormatter.formatToParts(tomorrow);
  const offsetText =
    parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+00:00";

  const match = offsetText.match(/GMT([+-])(\d{2}):(\d{2})/);

  let offsetMinutes = 0;

  if (match) {
    const sign = match[1] === "+" ? 1 : -1;
    offsetMinutes = sign * (Number(match[2]) * 60 + Number(match[3]));
  }

  const nextMidnightUtc =
    Date.UTC(year, month - 1, day + 1) - offsetMinutes * 60 * 1000;

  return Math.max(0, nextMidnightUtc - now.getTime());
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export default function NextPokemonCountdown() {
  const [remaining, setRemaining] = useState(getTimeUntilNextMadridDay());

  useEffect(() => {
    const interval = setInterval(() => {
      const time = getTimeUntilNextMadridDay();

      setRemaining(time);

      if (time <= 1000) {
        window.location.reload();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 border-t border-zinc-800 pt-5">
      <p className="text-xs uppercase tracking-widest text-zinc-500">
        Siguiente PokeSoundle en
      </p>

      <p className="mt-2 font-mono text-2xl font-bold">
        {formatTime(remaining)}
      </p>
    </div>
  );
}
