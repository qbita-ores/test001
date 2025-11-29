'use client';

import { useState, useCallback } from 'react';
import { Mic, Square, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  className?: string;
}

export function AudioRecorder({ onRecordingComplete, className }: AudioRecorderProps) {
  const {
    isRecording,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handleStartRecording = useCallback(async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  }, [startRecording]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    onRecordingComplete(blob);
  }, [stopRecording, onRecordingComplete]);

  const handlePlayRecording = useCallback(() => {
    if (!audioUrl) return;

    if (audio) {
      audio.pause();
      setAudio(null);
      setIsPlaying(false);
      return;
    }

    const newAudio = new Audio(audioUrl);
    newAudio.onended = () => {
      setIsPlaying(false);
      setAudio(null);
    };
    newAudio.play();
    setAudio(newAudio);
    setIsPlaying(true);
  }, [audioUrl, audio]);

  const handleReset = useCallback(() => {
    if (audio) {
      audio.pause();
      setAudio(null);
    }
    setIsPlaying(false);
    resetRecording();
  }, [audio, resetRecording]);

  return (
    <div className={cn("flex items-center justify-center space-x-3", className)}>
      {!audioBlob ? (
        <Button
          variant={isRecording ? "destructive" : "default"}
          size="lg"
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className="relative"
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5 mr-2" />
              Stop Recording
              <span className="absolute top-2 right-2 h-2 w-2 bg-white rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <Mic className="h-5 w-5 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      ) : (
        <>
          <Button variant="outline" onClick={handlePlayRecording}>
            {isPlaying ? (
              <>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Re-record
          </Button>
        </>
      )}

      {isRecording && (
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-500 font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
}
