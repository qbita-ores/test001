'use client';

import { useState, useCallback } from 'react';
import { Mic, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AudioRecorder } from '@/components/audio/AudioRecorder';
import { SpeakingExercise, PronunciationFeedback } from '@/domain/entities/Exercise';
import { LessonLevel } from '@/domain/entities/Lesson';
import { ExerciseTextResponse } from '@/domain/prompts';
import { cn } from '@/lib/utils';

interface SpeakingExerciseCreatorProps {
  onCreateExercise: (title: string, context: string, level: LessonLevel) => Promise<void>;
  onGenerateText: (partial: string) => Promise<ExerciseTextResponse>;
  isLoading?: boolean;
  defaultLevel?: LessonLevel;
}

export function SpeakingExerciseCreator({
  onCreateExercise,
  onGenerateText,
  isLoading = false,
  defaultLevel = 'C1',
}: SpeakingExerciseCreatorProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [instructions, setInstructions] = useState<string | null>(null);
  const [level, setLevel] = useState<LessonLevel>(defaultLevel);
  const [isGenerating, setIsGenerating] = useState(false);

  const levelOptions = [
    { value: 'C1', label: 'C1 - Intermediate' },
    { value: 'C2', label: 'C2 - Upper Intermediate' },
    { value: 'C3', label: 'C3 - Advanced' },
  ];

  const handleGenerateText = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await onGenerateText(context);
      // Update title only if empty
      if (!title.trim()) {
        setTitle(response.title);
      }
      setContext(response.content);
      setInstructions(response.instructions);
    } finally {
      setIsGenerating(false);
    }
  }, [context, title, onGenerateText]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    await onCreateExercise(title, context, level);
    setTitle('');
    setContext('');
    setInstructions(null);
  }, [title, context, level, onCreateExercise]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5 text-green-600" />
          <span>Create Speaking Exercise</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Daily Routine Description (or generate with AI)"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty Level
          </label>
          <Select
            value={level}
            onChange={(e) => setLevel(e.target.value as LessonLevel)}
            options={levelOptions}
            disabled={isLoading}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Text to Read (or context to generate)
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGenerateText}
              disabled={isGenerating || isLoading}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              {context ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
          <Textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Enter or generate a text for the student to read aloud..."
            rows={6}
            disabled={isLoading}
          />
        </div>

        {/* Instructions from AI (if any) */}
        {instructions && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <label className="block text-sm font-medium text-blue-800 mb-1">
              Instructions
            </label>
            <p className="text-sm text-blue-700">{instructions}</p>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || !context.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Create Exercise
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface SpeakingExerciseViewerProps {
  exercise: SpeakingExercise;
  onEvaluate: (recordingBlob: Blob) => Promise<void>;
  isLoading?: boolean;
}

export function SpeakingExerciseViewer({
  exercise,
  onEvaluate,
  isLoading = false,
}: SpeakingExerciseViewerProps) {
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleRecordingComplete = useCallback((blob: Blob) => {
    setRecordingBlob(blob);
  }, []);

  const handleEvaluate = useCallback(async () => {
    if (!recordingBlob) return;
    setIsEvaluating(true);
    try {
      await onEvaluate(recordingBlob);
    } finally {
      setIsEvaluating(false);
    }
  }, [recordingBlob, onEvaluate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{exercise.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          Level {exercise.level}
        </span>
      </div>

      {/* Text to Read */}
      <Card>
        <CardHeader>
          <CardTitle>Text to Read</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed text-gray-800 bg-gray-50 rounded-lg p-4">
            {exercise.originalText}
          </p>
        </CardContent>
      </Card>

      {/* Recording Section */}
      {!exercise.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Your Recording</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Read the text above aloud. When you&apos;re ready, click the button to start recording.
            </p>
            <AudioRecorder onRecordingComplete={handleRecordingComplete} />
            {recordingBlob && (
              <Button
                onClick={handleEvaluate}
                disabled={isEvaluating || isLoading}
                className="w-full"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Evaluating...
                  </>
                ) : (
                  'Submit for Evaluation'
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      {exercise.feedback && (
        <FeedbackCard
          feedback={exercise.feedback}
          transcription={exercise.transcription}
          originalText={exercise.originalText}
        />
      )}
    </div>
  );
}

interface FeedbackCardProps {
  feedback: PronunciationFeedback;
  transcription?: string;
  originalText: string;
}

function FeedbackCard({ feedback, transcription, originalText }: FeedbackCardProps) {
  const scoreColor =
    feedback.overallScore >= 80
      ? 'text-green-600'
      : feedback.overallScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Evaluation Results</span>
          <span className={cn('text-3xl font-bold', scoreColor)}>
            {feedback.overallScore}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-500',
              feedback.overallScore >= 80
                ? 'bg-green-500'
                : feedback.overallScore >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
            )}
            style={{ width: `${feedback.overallScore}%` }}
          />
        </div>

        {/* Comparison */}
        {transcription && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Original Text</h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                {originalText}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Reading</h4>
              <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                {transcription}
              </p>
            </div>
          </div>
        )}

        {/* Errors */}
        {feedback.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Pronunciation Errors</h4>
            <div className="space-y-2">
              {feedback.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 bg-red-50 rounded-lg p-3"
                >
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{error.word}</span>: expected &quot;
                      {error.expected}&quot;, heard &quot;{error.actual}&quot;
                    </p>
                    <p className="text-xs text-gray-600 mt-1">{error.suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {feedback.suggestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Suggestions</h4>
            <ul className="space-y-2">
              {feedback.suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 bg-blue-50 rounded-lg p-3"
                >
                  <CheckCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">{suggestion}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
