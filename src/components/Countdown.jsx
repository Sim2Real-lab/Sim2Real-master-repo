import { useState, useEffect } from 'react';

// Targets
const ROUND1_START = new Date('2026-10-07T00:00:00+05:30').getTime();
const ROUND1_END = new Date('2026-10-15T23:59:59+05:30').getTime();

const IDEATHON_START = new Date('2026-10-18T15:00:00+05:30').getTime();
const IDEATHON_END = new Date('2026-10-24T19:00:00+05:30').getTime();

function getTimeUnits(difference) {
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000),
  };
}

function calculateTimeLeft() {
  const now = new Date().getTime();

  // Phase 1: Before Round 1 Registration starts
  if (now < ROUND1_START) {
    const difference = ROUND1_START - now;
    return {
      isClosed: false,
      label: "Registration Starts In",
      timeLeft: getTimeUnits(difference),
    };
  }

  // Phase 2: During Round 1 Registration (Oct 7 to Oct 15, 11:59:59 PM)
  if (now >= ROUND1_START && now < ROUND1_END) {
    const difference = ROUND1_END - now;
    return {
      isClosed: false,
      label: "Registration Closes In",
      timeLeft: getTimeUnits(difference),
    };
  }

  // Phase 3: Inactive gap period between Round 1 and Ideathon (Oct 15 midnight to Oct 18, 3:00 PM)
  if (now >= ROUND1_END && now < IDEATHON_START) {
    return { isClosed: true, label: "Registration Closed" };
  }

  // Phase 4: During Ideathon Registration (Oct 18, 3:00 PM to Oct 24, 7:00 PM)
  if (now >= IDEATHON_START && now < IDEATHON_END) {
    const difference = IDEATHON_END - now;
    return {
      isClosed: false,
      label: "Ideathon Registration open",
      timeLeft: getTimeUnits(difference),
    };
  }

  // Phase 5: After Ideathon Registration closes (Oct 24, 7:00 PM onwards)
  return { isClosed: true, label: "Registration Closed" };
}

export const Countdown = () => {
  const [timeData, setTimeData] = useState(() => calculateTimeLeft());

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
      {!timeData.isClosed && (
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
      )}
    </div>
  );
};
