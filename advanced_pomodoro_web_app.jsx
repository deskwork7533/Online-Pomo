import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

const MODES = {
  pomodoro: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
};

export default function PomodoroApp() {
  const [mode, setMode] = useState("pomodoro");
  const [seconds, setSeconds] = useState(MODES.pomodoro);
  const [running, setRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  function handleComplete() {
    setRunning(false);
    if (mode === "pomodoro") {
      const next = (cycles + 1) % 4 === 0 ? "long" : "short";
      setCycles((c) => c + 1);
      switchMode(next);
    } else {
      switchMode("pomodoro");
    }
    new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play();
  }

  function switchMode(m) {
    setMode(m);
    setSeconds(MODES[m]);
  }

  function format(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <Card className="w-80 rounded-2xl shadow-xl">
        <CardContent className="p-6 text-center space-y-4">
          <h1 className="text-2xl font-semibold">Pomodoro</h1>
          <p className="text-5xl font-mono">{format(seconds)}</p>

          <div className="flex justify-center gap-2">
            <Button onClick={() => setRunning(!running)}>
              {running ? <Pause /> : <Play />}
            </Button>
            <Button variant="secondary" onClick={() => switchMode(mode)}>
              <RotateCcw />
            </Button>
          </div>

          <div className="flex justify-center gap-2 text-sm">
            <Button size="sm" variant={mode === "pomodoro" ? "default" : "ghost"} onClick={() => switchMode("pomodoro")}>
              Focus
            </Button>
            <Button size="sm" variant={mode === "short" ? "default" : "ghost"} onClick={() => switchMode("short")}>
              Short Break
            </Button>
            <Button size="sm" variant={mode === "long" ? "default" : "ghost"} onClick={() => switchMode("long")}>
              Long Break
            </Button>
          </div>

          <p className="text-xs opacity-70">Completed cycles: {cycles}</p>
        </CardContent>
      </Card>
    </div>
  );
}
