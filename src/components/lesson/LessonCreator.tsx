'use client';

import { useState, useCallback } from 'react';
import {
  BookOpen,
  Sparkles,
  Loader2,
  Volume2,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LessonLevel } from '@/domain/entities/Lesson';
import { ExerciseTextResponse } from '@/domain/prompts';
import { cn } from '@/lib/utils';

interface LessonCreatorProps {
  onCreateLesson: (title: string, context: string, level: LessonLevel) => Promise<void>;
  onSuggestContext: () => Promise<ExerciseTextResponse>;
  onCompleteContext: (partial: string) => Promise<ExerciseTextResponse>;
  chatAvailable?: boolean;
  isLoading?: boolean;
  defaultLevel?: LessonLevel;
}

export function LessonCreator({
  onCreateLesson,
  onSuggestContext,
  onCompleteContext,
  chatAvailable = false,
  isLoading = false,
  defaultLevel = 'C1',
}: LessonCreatorProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [instructions, setInstructions] = useState('');
  const [level, setLevel] = useState<LessonLevel>(defaultLevel);
  const [useChat, setUseChat] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const levelOptions = [
    { value: 'C1', label: 'C1 - Intermediate' },
    { value: 'C2', label: 'C2 - Upper Intermediate' },
    { value: 'C3', label: 'C3 - Advanced' },
  ];

  const handleSuggestContext = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await onSuggestContext();
      setTitle(response.title || '');
      setContext(response.content || '');
      setInstructions(response.instructions || '');
    } finally {
      setIsGenerating(false);
    }
  }, [onSuggestContext]);

  const handleCompleteContext = useCallback(async () => {
    if (!context.trim()) return;
    setIsGenerating(true);
    try {
      const response = await onCompleteContext(context);
      if (response.title && !title.trim()) {
        setTitle(response.title);
      }
      setContext(response.content || '');
      setInstructions(response.instructions || '');
    } finally {
      setIsGenerating(false);
    }
  }, [context, title, onCompleteContext]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) return;
    await onCreateLesson(title, useChat ? '' : context, level);
    setTitle('');
    setContext('');
    setInstructions('');
  }, [title, context, level, useChat, onCreateLesson]);

  return (
    <Card className="w-full relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-lg">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">Generating Lesson Content</p>
              <p className="text-sm text-gray-500 mt-1">
                Creating vocabulary, grammar points, and conjugations...
              </p>
              <p className="text-xs text-gray-400 mt-2">This may take a few seconds</p>
            </div>
          </div>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <span>Create New Lesson</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lesson Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Restaurant Conversations"
            disabled={isLoading}
          />
        </div>

        {/* Level Selection */}
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

        {/* Context Source */}
        {chatAvailable && (
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={!useChat}
                onChange={() => setUseChat(false)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Custom context</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                checked={useChat}
                onChange={() => setUseChat(true)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Use chat conversation</span>
            </label>
          </div>
        )}

        {/* Context Input */}
        {!useChat && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Lesson Context
              </label>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSuggestContext}
                  disabled={isGenerating || isLoading}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Generate idea
                </Button>
                {context.trim() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCompleteContext}
                    disabled={isGenerating || isLoading}
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the topic or context for this lesson..."
              rows={4}
              disabled={isLoading}
            />
            
            {/* Instructions Info Box */}
            {instructions && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Instructions</p>
                    <p className="text-sm text-blue-700 mt-1">{instructions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={!title.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating Lesson...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Create Lesson
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

interface LessonViewerProps {
  lesson: {
    title: string;
    level: string;
    content: {
      vocabulary: Array<{ term: string; definition: string; example: string }>;
      grammar: Array<{ title: string; explanation: string; examples: string[] }>;
      conjugations: Array<{ verb: string; tense: string; conjugations: Record<string, string> }>;
    };
  };
  onGenerateAudio?: (text: string) => Promise<void>;
  isLoading?: boolean;
}

type TabType = 'vocabulary' | 'grammar' | 'conjugations';

export function LessonViewer({ lesson, onGenerateAudio, isLoading = false }: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('vocabulary');

  const hasContent = lesson.content.vocabulary.length > 0 || 
                     lesson.content.grammar.length > 0 || 
                     lesson.content.conjugations.length > 0;

  // Show loading state when isLoading is true OR when lesson has no content yet
  const showLoading = isLoading || !hasContent;

  const tabs: { id: TabType; label: string }[] = [
    { id: 'vocabulary', label: 'Vocabulary' },
    { id: 'grammar', label: 'Grammar' },
    { id: 'conjugations', label: 'Conjugations' },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{lesson.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          Level {lesson.level}
        </span>
      </div>

      {showLoading ? (
        /* Loading State */
        <Card className="flex-1 flex flex-col overflow-hidden rounded-t-none border-t-0">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                <BookOpen className="absolute inset-0 m-auto h-8 w-8 text-blue-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">Generating Lesson Content</h3>
                <p className="text-gray-500">
                  Our AI is creating vocabulary, grammar points, and conjugations for your lesson...
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>This may take a few moments</span>
              </div>
              
              {/* Animated placeholder tabs */}
              <div className="w-full mt-4">
                <div className="flex space-x-8 border-b border-gray-200 pb-2">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
                <div className="mt-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2 pb-4 border-b border-gray-100">
                      <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div className="h-4 bg-gray-100 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-blue-50 rounded w-3/4 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Tabs Content */
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
                      ? 'border-blue-600 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <CardContent className="p-6">
            {/* Vocabulary Tab */}
            {activeTab === 'vocabulary' && (
              <div className="space-y-6">
                {lesson.content.vocabulary.map((item, index) => (
                  <div
                    key={index}
                    className="pb-6 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.term}</p>
                        <p className="text-sm text-gray-600 mt-1">{item.definition}</p>
                        {item.example && (
                          <p className="text-sm text-blue-600 mt-2 italic">
                            &quot;{item.example}&quot;
                          </p>
                        )}
                      </div>
                      {onGenerateAudio && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onGenerateAudio(item.term)}
                          className="h-8 w-8 ml-2"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {lesson.content.vocabulary.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No vocabulary items yet.</p>
                )}
              </div>
            )}

            {/* Grammar Tab */}
            {activeTab === 'grammar' && (
              <div className="space-y-6">
                {lesson.content.grammar.map((point, index) => (
                  <div key={index} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900">{point.title}</h4>
                    <p className="text-sm text-gray-600 mt-2">{point.explanation}</p>
                    {point.examples.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {point.examples.map((example, i) => (
                          <p key={i} className="text-sm text-blue-600 italic">
                            &quot;{example}&quot;
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {lesson.content.grammar.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No grammar points yet.</p>
                )}
              </div>
            )}

            {/* Conjugations Tab */}
            {activeTab === 'conjugations' && (
              <div className="space-y-6">
                {lesson.content.conjugations.map((table, index) => (
                  <div key={index} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{table.verb}</h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {table.tense}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(table.conjugations).map(([pronoun, conjugation]) => (
                        <div
                          key={pronoun}
                          className="flex justify-between bg-gray-50 rounded px-3 py-2 text-sm"
                        >
                          <span className="text-gray-500">{pronoun}</span>
                          <span className="font-medium text-gray-900">{conjugation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {lesson.content.conjugations.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No conjugations yet.</p>
                )}
              </div>
            )}
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  );
}
