

import React from 'react';

// --- Global Types ---
export type Language = 'en' | 'hi';

// --- Authentication & User Roles ---
export type UserRole = 'student' | 'teacher' | 'parent';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  studentId?: string; 
}

// --- Student Learning Types ---
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  trans?: {
    question?: string;
    options?: string[];
    explanation?: string;
  }
}

export interface Chapter {
  id: string;
  title: string;
  summary: string; // HTML/Markdown string
  videoUrl?: string; 
  quiz: QuizQuestion[];
  isDownloaded: boolean;
  isCompleted: boolean;
  isLocked?: boolean;
  lastStudied?: number; // Timestamp
  quizScore?: number; // Last score %
  trans?: {
    title?: string;
    summary?: string;
  }
}

export interface Subject {
  id: string;
  name: string;
  icon: string; // key string like 'math', 'sci'
  color: string;
  chapters: Chapter[];
  trans?: {
    name?: string;
  }
}

export interface UserProgress {
  totalXp: number;
  streakDays: number;
  badges: string[];
}

// --- Advanced Feature Types ---

export interface RevisionTask {
  chapterId: string;
  subjectId: string;
  title: string;
  reason: 'low_score' | 'long_time' | 'incomplete';
  daysSinceLast: number;
}

export interface Doubt {
  id: string;
  studentId: string;
  subjectId: string;
  text: string;
  timestamp: number;
  status: 'pending_sync' | 'sent' | 'resolved';
  reply?: string;
}

// --- Teacher Dashboard Types ---
export interface StudentSummary {
  id: string;
  name: string;
  attendance: number; 
  avgScore: number; 
  needsAttention: boolean;
}

// --- Content Creation & Sharing Types ---
export interface ContentPack {
  id: string;
  title: string;
  subjectId: string;
  size: string; 
  createdDate: string;
  version: number;
  chapterData: Chapter;
}

// --- View States ---
export type ViewState = 'landing' | 'dashboard' | 'subject_detail' | 'chapter_read' | 'quiz_mode' | 'content_creator' | 'doubt_corner' | 'brain_gym';
export type AppState = 'login' | 'app';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// --- UI/Notification Types ---
export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// --- Legacy Blueprint Types (if needed) ---
export enum BlueprintSection {
  TITLE = 'title',
  PROBLEM = 'problem',
  SOLUTION = 'solution',
  FEATURES = 'features',
  ARCHITECTURE = 'architecture',
  COMPONENTS = 'components',
  TECH_STACK = 'tech_stack',
  DATABASE = 'database',
  SYNC = 'sync',
  AI = 'ai',
  UX = 'ux',
  OPTIMIZATION = 'optimization',
  ROADMAP = 'roadmap',
  TEAM = 'team',
  FUTURE = 'future',
  CONCLUSION = 'conclusion',
  SCRIPT = 'script'
}
export interface SectionData {
  id: BlueprintSection;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}