interface ProgressProps {
  value?: number;
}

// Animated progress bar component
// The progress bar is updated using animations instead of a jump
export default function Progress({ value = 0 }: ProgressProps) {
  return (
    <div className="w-full bg-gradient-to-b from-gray-300 to-gray-100 rounded-full h-3">
      <div
        className="bg-gradient-to-b from-violet-300 to-blue-600 h-3 transition-all ease-out duration-[2000ms] rounded-full drop-shadow"
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}
