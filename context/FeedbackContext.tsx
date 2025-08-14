// context/FeedbackContext.tsx
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface Feedback {
  message: string;
  type: 'success' | 'error';
}

interface FeedbackContextType {
  feedback: Feedback | null;
  showFeedback: (feedback: Feedback) => void;
}

export const FeedbackContext = createContext<FeedbackContextType>({
  feedback: null,
  showFeedback: () => {},
});

export const FeedbackProvider = ({ children }: { children: ReactNode }) => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const showFeedback = useCallback((newFeedback: Feedback) => {
    setFeedback(newFeedback);
    setTimeout(() => {
      setFeedback(null);
    }, 3000);
  }, []);

  return (
    <FeedbackContext.Provider value={{ feedback, showFeedback }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => useContext(FeedbackContext);


