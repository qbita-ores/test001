'use client';

import { useEffect, useState, useCallback } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioUrl?: string;
  audioBlob?: Blob;
  onPlay?: () => void;
  className?: string;
  compact?: boolean;
}

export function AudioPlayer({
  audioUrl,
  audioBlob,
  onPlay,
  className,
  compact = false,
}: AudioPlayerProps) {
  const {
    isPlaying,
    isPaused,
    currentTime,
    duration,
    play,
    pause,
    stop,
    setAudioUrl,
    setAudioBlob,
  } = useAudioPlayer();

  const [hasAudio, setHasAudio] = useState(false);

  useEffect(() => {
    if (audioUrl) {
      setAudioUrl(audioUrl);
      setHasAudio(true);
    } else if (audioBlob) {
      setAudioBlob(audioBlob);
      setHasAudio(true);
    }
  }, [audioUrl, audioBlob, setAudioUrl, setAudioBlob]);

  const handlePlay = useCallback(() => {
    if (onPlay && !hasAudio) {
      onPlay();
    } else {
      play();
    }
  }, [onPlay, hasAudio, play]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying && !isPaused) {
      pause();
    } else {
      handlePlay();
    }
  }, [isPlaying, isPaused, pause, handlePlay]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        className={cn("h-8 w-8", className)}
        title={hasAudio ? (isPlaying && !isPaused ? "Pause" : "Play") : "Generate Audio"}
      >
        {!hasAudio ? (
          <Volume2 className="h-4 w-4" />
        ) : isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <div className={cn("flex items-center space-x-2 bg-gray-50 rounded-lg p-2", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        className="h-8 w-8"
      >
        {isPlaying && !isPaused ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={stop}
        className="h-8 w-8"
        disabled={!isPlaying}
      >
        <Square className="h-4 w-4" />
      </Button>

      <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      <span className="text-xs text-gray-500 min-w-[45px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}
