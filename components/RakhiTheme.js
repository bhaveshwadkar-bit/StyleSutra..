"use client";
import { useEffect, useState } from "react";

// Festival window — Indian Standard Time, so it's consistent no matter where a
// visitor's phone thinks it is. Starts now, ends automatically at midnight on the 29th.
const START = new Date("2026-08-21T00:00:00+05:30").getTime();
const END = new Date("2026-08-29T00:00:00+05:30").getTime();

export default function RakhiTheme() {
  // Starts as "not shown" on both server and client so there is never a
  // mismatch between the first render and the real one — the decoration
  // only ever appears after checking the real clock in the browser.
  const [active, setActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const now = Date.now();
    setActive(now >= START && now < END);
  }, []);

  if (!active || dismissed) return null;

  return (
    <>
      <div className="rakhi-ribbon">
        <span>🪢 Happy Raksha Bandhan from Style Sutra! 🪢</span>
        <button className="rakhi-ribbon-close" onClick={() => setDismissed(true)} aria-label="Dismiss">×</button>
      </div>
      <div className="rakhi-strip" />
      <div className="rakhi-corner-decor" aria-hidden="true">🪔</div>
    </>
  );
}
