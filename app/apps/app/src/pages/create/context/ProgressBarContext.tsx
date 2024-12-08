import { createContext, useState, useContext, Dispatch, SetStateAction } from "react";

interface ProgressBarContextType {
  showProgressBar: boolean;
  setShowProgressBar: Dispatch<SetStateAction<boolean>>;
  progressBarText: string;
  setProgressBarText: Dispatch<SetStateAction<string>>;
  progress: number;
  setProgress: Dispatch<SetStateAction<number>>;
  intervalStep: number;
  setIntervalStep: Dispatch<SetStateAction<number>>;
}

// Define the context
const ProgressBarContext = createContext<ProgressBarContextType | null>(null);

// Define the provider
export const ProgressBarProvider = ({ children }) => {
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressBarText, setProgressBarText] = useState("");
  const [progress, setProgress] = useState(0);
  const [intervalStep, setIntervalStep] = useState(1000);

  return (
    <ProgressBarContext.Provider
      value={{
        showProgressBar,
        setShowProgressBar,
        progressBarText,
        setProgressBarText,
        progress,
        setProgress,
        intervalStep,
        setIntervalStep,
      }}
    >
      {children}
    </ProgressBarContext.Provider>
  );
};

// Define a hook for easy usage of the context
export const useProgressBar = () => {
  const context = useContext(ProgressBarContext);

  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerContextProvider");
  }

  return context;
};
