'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  MessageSquare,
  BookOpen,
  Mic,
  Headphones,
  Settings,
  Menu,
  X,
  GraduationCap,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: 'Chat', href: '/', icon: MessageSquare, color: 'text-blue-600' },
  { name: 'Lessons', href: '/lessons', icon: BookOpen, color: 'text-indigo-600' },
  { name: 'Speaking', href: '/speaking', icon: Mic, color: 'text-green-600' },
  { name: 'Listening', href: '/listening', icon: Headphones, color: 'text-purple-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0",
          "lg:static lg:z-auto",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className={cn("flex items-center space-x-3", !isOpen && "lg:justify-center")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              {isOpen && (
                <span className="font-bold text-gray-900 text-lg">LinguaAI</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-3 rounded-xl transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    !isOpen && "lg:justify-center"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-600" : item.color
                    )}
                  />
                  {isOpen && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Collapse button for desktop */}
          <div className="p-3 border-t border-gray-100 hidden lg:block">
            <Button
              variant="ghost"
              onClick={onToggle}
              className={cn("w-full", !isOpen && "justify-center")}
            >
              <ChevronLeft
                className={cn(
                  "h-5 w-5 transition-transform",
                  !isOpen && "rotate-180"
                )}
              />
              {isOpen && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title }: HeaderProps) {
  return (
    <header className="h-14 flex-shrink-0 bg-white border-b border-gray-100 px-4 lg:px-6">
      <div className="h-full flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {title && <h1 className="text-lg font-semibold text-gray-900">{title}</h1>}
        </div>
      </div>
    </header>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, sidebar, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} title={title} />
        
        <div className="flex-1 flex overflow-hidden">
          {/* Optional page-specific sidebar */}
          {sidebar && (
            <div className="hidden md:flex md:flex-col w-80 bg-white border-r border-gray-100 flex-shrink-0">
              <div className="flex-1 overflow-y-auto">
                {sidebar}
              </div>
            </div>
          )}
          
          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
