import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PRESET_DURATIONS = [5, 10, 15, 20];

export default function GameTimer() {
  const [duration, setDuration] = useState(10 * 60); // Default 10 minutes in seconds
  const [timeRemaining, setTimeRemaining] = useState(10 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize AudioContext
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsFinished(true);
            playAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const playAlarm = async () => {
    if (!audioContextRef.current) return;

    // Resume AudioContext if suspended (required for user interaction)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const beep = (frequency: number, duration: number, delay: number) => {
      setTimeout(() => {
        if (!audioContextRef.current) return;
        
        const oscillator = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'square';
        
        const now = audioContextRef.current.currentTime;
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
      }, delay);
    };

    // Play alarm sequence: 3 beeps
    beep(880, 0.2, 0);      // First beep
    beep(880, 0.2, 300);    // Second beep
    beep(880, 0.3, 600);    // Third beep (longer)
  };

  const handleStart = async () => {
    // Resume AudioContext on user interaction (required for browser audio policies)
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    
    if (timeRemaining === 0) {
      setTimeRemaining(duration);
      setIsFinished(false);
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(duration);
    setIsFinished(false);
  };

  const handlePresetClick = (minutes: number) => {
    const seconds = minutes * 60;
    setDuration(seconds);
    setTimeRemaining(seconds);
    setIsRunning(false);
    setIsFinished(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (timeRemaining / duration) * 100 : 0;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Game Timer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preset Duration Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {PRESET_DURATIONS.map((minutes) => (
            <Button
              key={minutes}
              variant={duration === minutes * 60 ? "default" : "outline"}
              size="sm"
              onClick={() => handlePresetClick(minutes)}
              disabled={isRunning}
              className="rounded-full"
              data-testid={`button-preset-${minutes}`}
            >
              {minutes} min
            </Button>
          ))}
        </div>

        {/* Circular Timer */}
        <div className="flex justify-center">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="128"
                cy="128"
                r="90"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="128"
                cy="128"
                r="90"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ${
                  isFinished ? 'animate-pulse' : ''
                }`}
              />
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`text-5xl font-bold tabular-nums ${
                  isFinished ? 'text-destructive animate-pulse' : 'text-foreground'
                }`}
                data-testid="text-timer-display"
              >
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                {isFinished ? 'Time Up!' : 'Remaining'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="rounded-full px-8"
              data-testid="button-timer-start"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button
              onClick={handlePause}
              variant="outline"
              className="rounded-full px-8"
              data-testid="button-timer-pause"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button
            onClick={handleReset}
            variant="outline"
            className="rounded-full"
            data-testid="button-timer-reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
