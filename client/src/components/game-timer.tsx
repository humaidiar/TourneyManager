import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, VolumeX } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import alarmSound from "@assets/ios_17_alarm_1763615561381.mp3";

const PRESET_DURATIONS = [5, 10, 15];

export default function GameTimer() {
  const [duration, setDuration] = useState(0); // Default 0 minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Initialize audio element with the alarm sound
    audioRef.current = new Audio(alarmSound);
    audioRef.current.loop = true; // Loop until stopped
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
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
    if (!audioRef.current) return;
    
    try {
      audioRef.current.currentTime = 0; // Reset to beginning
      await audioRef.current.play();
      setIsAlarmPlaying(true);
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsAlarmPlaying(false);
    }
  };

  const handleStart = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(duration);
      setIsFinished(false);
    }
    setIsRunning(true);
    stopAlarm(); // Stop alarm if it was playing
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

  const calculateAngleFromEvent = (e: MouseEvent | TouchEvent): number | null => {
    if (!svgRef.current) return null;
    
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let clientX: number, clientY: number;
    if (e instanceof MouseEvent) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    // Calculate angle in degrees (0° at top, clockwise)
    let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    return angle;
  };

  const setDurationFromAngle = (angle: number) => {
    // Convert angle (0-360) to minutes (1-60)
    const minutes = Math.max(1, Math.round((angle / 360) * 60));
    const seconds = minutes * 60;
    setDuration(seconds);
    setTimeRemaining(seconds);
    setIsFinished(false);
  };

  const handleCircleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (isRunning) return; // Can't adjust while running
    e.preventDefault();
    setIsDragging(true);
    
    const angle = calculateAngleFromEvent(e.nativeEvent as MouseEvent | TouchEvent);
    if (angle !== null) {
      setDurationFromAngle(angle);
    }
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isRunning) return;
    
    const angle = calculateAngleFromEvent(e);
    if (angle !== null) {
      setDurationFromAngle(angle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleMouseMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  const circumference = 2 * Math.PI * 90; // radius = 90
  
  // Both setting and running use the same 60-minute scale so arc stays proportional
  // When setting: duration / 3600 shows portion of circle filled
  // When running: timeRemaining / 3600 shows same arc shrinking
  const maxSeconds = 60 * 60; // 60 minutes
  const displayValue = isRunning ? timeRemaining : duration;
  const progress = maxSeconds > 0 ? (displayValue / maxSeconds) * 100 : 0;
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
            <svg 
              ref={svgRef}
              className="w-full h-full transform -rotate-90"
              onMouseDown={handleCircleMouseDown}
              onTouchStart={handleCircleMouseDown}
              style={{ cursor: isRunning ? 'default' : 'pointer' }}
            >
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
                strokeWidth={isDragging ? "12" : "8"}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all ${
                  isDragging ? 'duration-75' : 'duration-1000'
                } ${isFinished ? 'animate-pulse' : ''}`}
              />
              {/* Interactive overlay circle for better drag area */}
              {!isRunning && (
                <circle
                  cx="128"
                  cy="128"
                  r="90"
                  fill="none"
                  stroke="transparent"
                  strokeWidth="30"
                  className="hover:stroke-primary/10 transition-colors cursor-pointer"
                />
              )}
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div
                className={`text-5xl font-bold tabular-nums ${
                  isFinished ? 'text-destructive animate-pulse' : 'text-foreground'
                }`}
                data-testid="text-timer-display"
              >
                {formatTime(timeRemaining)}
              </div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                {isFinished ? 'Time Up!' : isRunning ? 'Remaining' : 'Set Duration'}
              </div>
            </div>
          </div>
        </div>

        {/* Alarm Stop Button - shown when alarm is playing */}
        {isAlarmPlaying && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={stopAlarm}
              variant="destructive"
              className="rounded-full px-8 animate-pulse"
              data-testid="button-stop-alarm"
            >
              <VolumeX className="w-4 h-4 mr-2" />
              Stop Alarm
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button
              onClick={handleStart}
              className="rounded-full px-8"
              data-testid="button-timer-start"
              disabled={duration === 0}
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
