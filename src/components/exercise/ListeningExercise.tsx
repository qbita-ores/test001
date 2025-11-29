'use client';

import { useState, useCallback } from 'react';
import { Headphones, Sparkles, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AudioPlayer } from '@/components/audio/AudioPlayer';
import { ListeningExercise, ListeningFeedback } from '@/domain/entities/Exercise';
import { LessonLevel } from '@/domain/entities/Lesson';
import { ExerciseTextResponse } from '@/domain/prompts';
import { cn } from '@/lib/utils';

interface ListeningExerciseCreatorProps {
  onCreateExercise: (title: string, context: string, level: LessonLevel) => Promise<void>;
  onGenerateText: (partial: string) => Promise<ExerciseTextResponse>;
  isLoading?: boolean;
  defaultLevel?: LessonLevel;
}

export function ListeningExerciseCreator({
  onCreateExercise,
  onGenerateText,
  isLoading = false,
  defaultLevel = 'C1',
}: ListeningExerciseCreatorProps) {
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
          <Headphones className="h-5 w-5 text-purple-600" />
          <span>Create Listening Exercise</span>
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
            placeholder="e.g., News Report Dictation (or generate with AI)"
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
              Text for Audio (or context to generate)
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
            placeholder="Enter or generate text that will be converted to audio..."
            rows={6}
            disabled={isLoading}
          />
        </div>

        {/* Instructions from AI (if any) */}
        {instructions && (
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <label className="block text-sm font-medium text-purple-800 mb-1">
              Instructions
            </label>
            <p className="text-sm text-purple-700">{instructions}</p>
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
              <Headphones className="h-4 w-4 mr-2" />
              Create Exercise
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface ListeningExerciseViewerProps {
  exercise: ListeningExercise;
  onGenerateAudio: () => Promise<void>;
  onEvaluate: (transcription: string) => Promise<void>;
  isLoading?: boolean;
}

export function ListeningExerciseViewer({
  exercise,
  onGenerateAudio,
  onEvaluate,
  isLoading = false,
}: ListeningExerciseViewerProps) {
  const [transcription, setTranscription] = useState(exercise.userTranscription || '');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const handleGenerateAudio = useCallback(async () => {
    setIsGeneratingAudio(true);
    try {
      await onGenerateAudio();
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [onGenerateAudio]);

  const handleEvaluate = useCallback(async () => {
    if (!transcription.trim()) return;
    setIsEvaluating(true);
    try {
      await onEvaluate(transcription);
    } finally {
      setIsEvaluating(false);
    }
  }, [transcription, onEvaluate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{exercise.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          Level {exercise.level}
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-1">
      {/* Audio Player */}
      <Card className="rounded-t-none border-t-0">
        <CardHeader>
          <CardTitle>Listen to the Audio</CardTitle>
        </CardHeader>
        <CardContent>
          {exercise.audioUrl || exercise.audioBlob ? (
            <AudioPlayer
              audioUrl={exercise.audioUrl}
              audioBlob={exercise.audioBlob}
            />
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4">
                Audio not yet generated for this exercise.
              </p>
              <Button
                onClick={handleGenerateAudio}
                disabled={isGeneratingAudio || isLoading}
              >
                {isGeneratingAudio ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating Audio...
                  </>
                ) : (
                  <>
                    <Headphones className="h-4 w-4 mr-2" />
                    Generate Audio
                  </>
                )}
              </Button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-3 text-center">
            Listen as many times as you need, then write what you hear below.
          </p>
        </CardContent>
      </Card>

      {/* Transcription Input */}
      {!exercise.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>Write What You Hear</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              placeholder="Type what you hear in the audio..."
              rows={6}
              disabled={isLoading}
            />
            <Button
              onClick={handleEvaluate}
              disabled={!transcription.trim() || isEvaluating || isLoading}
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
          </CardContent>
        </Card>
      )}

      {/* Feedback Section */}
      {exercise.feedback && (
        <ListeningFeedbackCard
          feedback={exercise.feedback}
          userTranscription={exercise.userTranscription}
          originalText={exercise.originalText}
        />
      )}
        </div>
      </div>
    </div>
  );
}

interface ListeningFeedbackCardProps {
  feedback: ListeningFeedback;
  userTranscription?: string;
  originalText: string;
}

function ListeningFeedbackCard({
  feedback,
  userTranscription,
  originalText,
}: ListeningFeedbackCardProps) {
  const scoreColor =
    feedback.overallScore >= 80
      ? 'text-green-600'
      : feedback.overallScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  const comprehensionColors: Record<string, string> = {
    excellent: 'bg-green-100 text-green-700',
    good: 'bg-blue-100 text-blue-700',
    fair: 'bg-yellow-100 text-yellow-700',
    'needs-improvement': 'bg-red-100 text-red-700',
  };

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
        {/* Score Bar & Comprehension Level */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
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
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              comprehensionColors[feedback.comprehensionLevel]
            )}
          >
            {feedback.comprehensionLevel.replace('-', ' ')}
          </span>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Original Text</h4>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              {originalText}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Transcription</h4>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
              {userTranscription}
            </p>
          </div>
        </div>

        {/* Errors */}
        {feedback.errors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Errors Found</h4>
            <div className="space-y-2">
              {feedback.errors.map((error, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 bg-red-50 rounded-lg p-3"
                >
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm">
                    Expected &quot;<span className="font-medium">{error.expected}</span>&quot;,
                    wrote &quot;<span className="font-medium">{error.actual}</span>&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spelling Errors */}
        {feedback.spellingErrors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Spelling Errors</h4>
            <div className="flex flex-wrap gap-2">
              {feedback.spellingErrors.map((word, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {feedback.errors.length === 0 && feedback.spellingErrors.length === 0 && (
          <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <p className="text-green-700 font-medium">
              Excellent work! Your transcription is accurate.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
