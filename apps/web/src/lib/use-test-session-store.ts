'use client';

import { create } from 'zustand';

type TestSessionState = {
  answers: Record<string, number>;
  currentIndex: number;
  setAnswer: (questionId: string, answer: number) => void;
  setCurrentIndex: (index: number) => void;
  hydrate: (answers: Record<string, number>) => void;
  clear: () => void;
};

export const useTestSessionStore = create<TestSessionState>((set) => ({
  answers: {},
  currentIndex: 0,
  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    })),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  hydrate: (answers) => set({ answers, currentIndex: 0 }),
  clear: () => set({ answers: {}, currentIndex: 0 }),
}));
