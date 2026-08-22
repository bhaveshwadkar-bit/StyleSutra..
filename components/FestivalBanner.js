"use client";
import { useEffect, useState } from "react";

export default function FestivalBanner({ text, endAt }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!endAt) return;
    const target = new Date(endAt).getTime();

    function tick() {
      const diff = target - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [endAt]);

  let countdownText = "";
  if (remaining !== null && remaining > 0) {
    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    countdownText = `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
  }

  return (
    <div className="festival-banner">
      <span>{text}</span>
      {countdownText && (
        <span className="festival-banner-countdown">⏳ Ends in {countdownText}</span>
      )}
    </div>
  );
}
