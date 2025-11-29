'use client';

import { useState, useRef, useCallback } from 'react';

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setAudioUrl: (url: string) => void;
  setAudioBlob: (blob: Blob) => void;
}

export function useAudioPlayer(): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });

      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });

      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentTime(0);
      });

      audioRef.current.addEventListener('play', () => {
        setIsPlaying(true);
        setIsPaused(false);
      });

      audioRef.current.addEventListener('pause', () => {
        setIsPaused(true);
      });
    }
    return audioRef.current;
  }, []);

  const setAudioUrl = useCallback((url: string) => {
    const audio = initAudio();
    audio.src = url;
    audio.load();
  }, [initAudio]);

  const setAudioBlob = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
  }, [setAudioUrl]);

  const play = useCallback(() => {
    const audio = initAudio();
    audio.play();
  }, [initAudio]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentTime(0);
    }
  }, []);

  return {
    isPlaying,
    isPaused,
    currentTime,
    duration,
    play,
    pause,
    stop,
    setAudioUrl,
    setAudioBlob,
  };
}
