import { useState, useEffect } from 'react';

// Targets
const START_DATE = new Date('2026-09-12T00:00:00+05:30').getTime();
const END_DATE = new Date('2026-09-20T11:00:00+05:30').getTime();

export const Countdown = () => {
  const [timeData, setTimeData] = useState(() => calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    
    let target = START_DATE;
    let label = "Registration Starts In:";
    
    if (now >= START_DATE) {
      target = END_DATE;
      label = "Registration Ends In:";
    }

    const difference = target - now;

    if (difference <= 0) {
      return { label: "Registration Closed", timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 } };
    }

    return {
      label,
      timeLeft: {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num) => num.toString().padStart(2, '0');

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium tracking-tight text-foreground/60 uppercase">
        {timeData.label}
      </div>
      <div className="flex gap-4 md:gap-8 items-end">
        {Object.entries(timeData.timeLeft).map(([unit, value]) => (
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
