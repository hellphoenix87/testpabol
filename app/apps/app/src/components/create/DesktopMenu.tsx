import { MenuContent } from "./MenuContent";

interface DesktopMenuProps {
  currentStep: number;
  maxStep: number;
  setCurrentStep: (step: number) => void;
}

export function DesktopMenu({ currentStep, maxStep, setCurrentStep }: DesktopMenuProps) {
  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
        <MenuContent currentStep={currentStep} maxStep={maxStep} setCurrentStep={setCurrentStep} />
      </div>
    </div>
  );
}
