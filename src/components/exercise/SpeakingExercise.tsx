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
    } catch (error) {
      console.error('Error generating text:', error);
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

type SpeakingTabType = 'text' | 'results';

export function SpeakingExerciseViewer({
  exercise,
  onEvaluate,
  isLoading = false,
}: SpeakingExerciseViewerProps) {
  const [activeTab, setActiveTab] = useState<SpeakingTabType>('text');
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
      // Switch to results tab after evaluation
      setActiveTab('results');
    } finally {
      setIsEvaluating(false);
    }
  }, [recordingBlob, onEvaluate]);

  const tabs: { id: SpeakingTabType; label: string }[] = [
    { id: 'text', label: 'Text to Read' },
    { id: 'results', label: 'Evaluation Results' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{exercise.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          Level {exercise.level}
        </span>
      </div>

      {/* Tabs Content */}
      <Card className="flex-1 flex flex-col overflow-hidden rounded-t-none border-t-0">
        {/* Tab Headers - Fixed */}
        <div className="flex-shrink-0 border-b border-gray-200 bg-white">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-green-600 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <CardContent className="p-6 flex-1 flex flex-col min-h-0">
            {/* Text to Read Tab */}
            {activeTab === 'text' && (
              <div className="h-full flex flex-col">
                {/* Text Display - Scrollable */}
                <div className="flex-1 overflow-y-auto">
                  <p className="text-lg leading-relaxed text-gray-800 bg-gray-50 rounded-lg p-6">
                    {exercise.originalText}
                  </p>

                  {/* Show hint to see results if feedback exists */}
                  {exercise.feedback && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                      <p className="text-green-700">
                        Your recording has been evaluated! Check the results tab.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveTab('results')}
                        className="border-green-600 text-green-600 hover:bg-green-50"
                      >
                        View Results
                      </Button>
                    </div>
                  )}
                </div>

                {/* Recording Section - Fixed at bottom */}
                {!exercise.feedback && (
                  <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 bg-white">
                    <div className="flex flex-col items-center space-y-4">
                      <p className="text-sm text-gray-600 text-center">
                        Read the text above aloud. When you&apos;re ready, click the button to start recording.
                      </p>
                      <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                      {recordingBlob && (
                        <Button
                          onClick={handleEvaluate}
                          disabled={isEvaluating || isLoading}
                          className="w-full max-w-md"
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
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Evaluation Results Tab */}
            {activeTab === 'results' && (
              <div className="space-y-6">
                {exercise.feedback ? (
                  <FeedbackContent
                    feedback={exercise.feedback}
                    transcription={exercise.transcription}
                    originalText={exercise.originalText}
                  />
                ) : (
                  <div className="text-center py-12">
                    <Mic className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No evaluation results yet.</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Record your reading and submit for evaluation.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTab('text')}
                      className="mt-4"
                    >
                      Go to Text
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
}

interface FeedbackContentProps {
  feedback: PronunciationFeedback;
  transcription?: string;
  originalText: string;
}

function FeedbackContent({ feedback, transcription, originalText }: FeedbackContentProps) {
  const scoreColor =
    feedback.overallScore >= 80
      ? 'text-green-600'
      : feedback.overallScore >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Your Score</h3>
        <span className={cn('text-4xl font-bold', scoreColor)}>
          {feedback.overallScore}%
        </span>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Original Text</h4>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">
              {originalText}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Your Reading</h4>
            <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-4">
              {transcription}
            </p>
          </div>
        </div>
      )}

      {/* Errors */}
      {feedback.errors.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Pronunciation Errors</h4>
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
        <div className="pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Suggestions</h4>
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

      {/* Perfect Score Message */}
      {feedback.errors.length === 0 && feedback.overallScore >= 90 && (
        <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <p className="text-green-700 font-medium">
            Excellent pronunciation! Keep up the great work.
          </p>
        </div>
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
