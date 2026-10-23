import { useEffect, useState } from "react";
function GeneratingCard() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id); // stop the timer when the card disappears
  }, []);

  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  const time =
    minutes > 0 ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;

  return (
    <div className="generating-card" role="status" aria-live="polite">
      <div className="orbit-ring" aria-hidden="true" />
      <div className="generating-text">
        <p className="generating-title">Generating your blog</p>
        <p className="generating-sub">
          This includes creating 3–6 images, so it may take a little while.
          Please keep this page open.
        </p>
      </div>
      <span className="generating-timer">{time}</span>
    </div>
  );
}

export default GeneratingCard;
