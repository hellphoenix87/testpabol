import { useState, useEffect, useRef } from "react";
import Lottie from "react-lottie-player";
import { useProgressBar } from "@app/pages/create/context/ProgressBarContext";
import Progress from "./Progress";

interface ProgressBarProps {
  maxStep: number;
}

const LoadingAnimations = [
  "/logo_animations/type.json",
  "/logo_animations/photo.json",
  "/logo_animations/movie.json",
  "/logo_animations/idle.json",
];

export default function ProgressBar({ maxStep }: ProgressBarProps) {
  const { progressBarText, setShowProgressBar, progress, intervalStep } = useProgressBar();
  const [localProgress, setLocalProgress] = useState(1);
  const [minProgress, setMinProgress] = useState(1);
  const progressRef = useRef(1);
  const intervalRef = useRef(1);

  useEffect(() => {
    if (progress >= 95) {
      progressRef.current = progress;
      setLocalProgress(localProgress);
    }
  }, [progress]);

  useEffect(() => {
    intervalRef.current = intervalStep;
  }, [intervalStep]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progressRef.current >= 100) {
        setShowProgressBar(false);
      } else {
        progressRef.current += 1;
        setLocalProgress(progressRef.current);
      }
    }, intervalRef.current);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMinProgress(currMinProgress => Math.max(currMinProgress, localProgress));
  }, [localProgress]);

  return (
    <div className="flex flex-col text-center">
      <div>
        <Lottie
          path={LoadingAnimations[maxStep % LoadingAnimations.length]}
          className="mx-auto w-1/2 lg:w-1/4"
          loop
          play
        />
      </div>
      <div className="relative">
        <p className="text-base font-semibold text-indigo-600">Please wait...</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">{progressBarText}</h2>

        <div className="flex flex-col items-center justify-center gap-4 mb-2 mt-10">
          <p className="text-base text-gray-500">{localProgress} %</p>

          <div className="w-1/2">
            <Progress value={minProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}
