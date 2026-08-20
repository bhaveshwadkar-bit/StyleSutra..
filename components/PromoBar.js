"use client";
import { useState, useEffect } from "react";

export default function PromoBar({ messages }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIdx((i) => (i + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

  if (!messages || messages.length === 0) return null;

  function prev() {
    setIdx((i) => (i - 1 + messages.length) % messages.length);
  }
  function next() {
    setIdx((i) => (i + 1) % messages.length);
  }

  return (
    <div className="promo-bar">
      {messages.length > 1 && (
        <button className="promo-bar-nav" onClick={prev} aria-label="Previous message">‹</button>
      )}
      <span className="promo-bar-text">{messages[idx].text}</span>
      {messages.length > 1 && (
        <button className="promo-bar-nav" onClick={next} aria-label="Next message">›</button>
      )}
    </div>
  );
}
