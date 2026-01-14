'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
}

interface DemoTourContextValue {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  startTour: (steps: TourStep[]) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  currentStepData: TourStep | null;
}

const DemoTourContext = createContext<DemoTourContextValue | null>(null);

const TOUR_STORAGE_KEY = 'demo-tour-completed';

export function DemoTourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const startTour = useCallback((tourSteps: TourStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
    // Mark tour as completed
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStep, steps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStep(index);
    }
  }, [steps.length]);

  const currentStepData = isActive && steps[currentStep] ? steps[currentStep] : null;

  // Scroll to current step target
  useEffect(() => {
    if (currentStepData) {
      const target = document.getElementById(currentStepData.targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStepData]);

  return (
    <DemoTourContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        endTour,
        nextStep,
        prevStep,
        goToStep,
        currentStepData,
      }}
    >
      {children}
    </DemoTourContext.Provider>
  );
}

export function useDemoTour() {
  const context = useContext(DemoTourContext);
  if (!context) {
    throw new Error('useDemoTour must be used within a DemoTourProvider');
  }
  return context;
}

export function useHasCompletedTour(): boolean {
  const [completed, setCompleted] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCompleted(localStorage.getItem(TOUR_STORAGE_KEY) === 'true');
    }
  }, []);

  return completed;
}

export function resetTourCompletion() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }
}
