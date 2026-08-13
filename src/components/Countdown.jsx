import { useState, useEffect } from 'react';

// Hardcoded target date for registration end (e.g., Sept 12, 2025)
const TARGET_DATE = new Date('2025-09-12T09:00:00+05:30').getTime();

export const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = TARGET_DATE - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium tracking-tight text-foreground/60 uppercase">
        Registration Ends In:
      </div>
      <div className="flex gap-4 md:gap-8 items-end">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="flex flex-col items-start gap-1">
            <div className="font-display font-bold text-4xl md:text-5xl leading-none">
              {format(value)}
            </div>
            <div className="text-xs font-semibold tracking-wider text-primary uppercase">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
