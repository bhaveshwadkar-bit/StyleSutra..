"use client";
import { useEffect, useState } from "react";

export default function GateClient({ mode, siteName, title, subtitle, launchAt, instagramId, whatsapp }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (mode !== "launch" || !launchAt) return;
    const target = new Date(launchAt).getTime();

    function tick() {
      const diff = target - Date.now();
      setRemaining(diff > 0 ? diff : 0);
    }
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [mode, launchAt]);

  const showCountdown = mode === "launch" && launchAt && remaining !== null && remaining > 0;

  let days = 0, hours = 0, minutes = 0, seconds = 0;
  if (showCountdown) {
    const totalSeconds = Math.floor(remaining / 1000);
    days = Math.floor(totalSeconds / 86400);
    hours = Math.floor((totalSeconds % 86400) / 3600);
    minutes = Math.floor((totalSeconds % 3600) / 60);
    seconds = totalSeconds % 60;
  }

  return (
    <main className="gate-screen">
      <div className="gate-content">
        <p className="gate-emoji">{mode === "maintenance" ? "🛠️" : "✨"}</p>
        <h1 className="font-display gate-brand">{siteName}</h1>
        <h2 className="gate-title">{title}</h2>
        {subtitle && <p className="gate-subtitle">{subtitle}</p>}

        {showCountdown && (
          <div className="gate-countdown">
            <div className="gate-countdown-unit"><span>{days}</span><label>Days</label></div>
            <div className="gate-countdown-unit"><span>{String(hours).padStart(2, "0")}</span><label>Hours</label></div>
            <div className="gate-countdown-unit"><span>{String(minutes).padStart(2, "0")}</span><label>Min</label></div>
            <div className="gate-countdown-unit"><span>{String(seconds).padStart(2, "0")}</span><label>Sec</label></div>
          </div>
        )}

        {(instagramId || whatsapp) && (
          <div className="gate-links">
            {instagramId && (
              <a href={`https://instagram.com/${instagramId.replace("@", "")}`} target="_blank" rel="noreferrer">
                📷 {instagramId}
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                💬 WhatsApp
              </a>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
