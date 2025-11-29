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
}

export function LessonViewer({ lesson, onGenerateAudio }: LessonViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    vocabulary: true,
    grammar: true,
    conjugations: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold">{lesson.title}</h2>
        <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm">
          Level {lesson.level}
        </span>
      </div>

      {/* Vocabulary Section */}
      <Card>
        <button
          onClick={() => toggleSection('vocabulary')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold flex items-center">
            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm">
              V
            </span>
            Vocabulary ({lesson.content.vocabulary.length})
          </h3>
          {expandedSections.vocabulary ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.vocabulary && (
          <CardContent className="pt-0">
            <div className="grid gap-4">
              {lesson.content.vocabulary.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
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
                        className="h-8 w-8"
                      >
                        <Volume2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Grammar Section */}
      <Card>
        <button
          onClick={() => toggleSection('grammar')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-sm">
              G
            </span>
            Grammar ({lesson.content.grammar.length})
          </h3>
          {expandedSections.grammar ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.grammar && (
          <CardContent className="pt-0">
            <div className="space-y-6">
              {lesson.content.grammar.map((point, index) => (
                <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-900">{point.title}</h4>
                  <p className="text-sm text-gray-600 mt-2">{point.explanation}</p>
                  {point.examples.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {point.examples.map((example, i) => (
                        <p key={i} className="text-sm text-blue-600 italic">
                          • {example}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Conjugations Section */}
      <Card>
        <button
          onClick={() => toggleSection('conjugations')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold flex items-center">
            <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-3 text-sm">
              C
            </span>
            Conjugations ({lesson.content.conjugations.length})
          </h3>
          {expandedSections.conjugations ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </button>
        {expandedSections.conjugations && (
          <CardContent className="pt-0">
            <div className="space-y-6">
              {lesson.content.conjugations.map((table, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">{table.verb}</span>
                    <span className="text-sm text-gray-500">{table.tense}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(table.conjugations).map(([pronoun, conjugation]) => (
                      <div key={pronoun} className="flex justify-between bg-white rounded px-3 py-2">
                        <span className="text-gray-500">{pronoun}</span>
                        <span className="font-medium text-gray-900">{conjugation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
