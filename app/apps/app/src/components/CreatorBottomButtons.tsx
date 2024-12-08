import { LockOpenIcon } from "@heroicons/react/20/solid";
import { PrimaryButton, SecondaryButton, WarningButton } from "@frontend/buttons";
import { classNames } from "@frontend/utils/classNames";

interface CreatorBottomButtonsProps {
  showLockSymbol?: boolean;
  nextButtonString?: string;
  prevButtonString?: string;
  disableNextButton?: boolean;
  nextStepFun?: () => void;
  prevStepFun?: () => void;
  setUnlockWarningOpen?: (value: boolean) => void;
}

export function CreatorBottomButtons({
  nextStepFun,
  prevStepFun,
  showLockSymbol = false,
  nextButtonString = "",
  prevButtonString = "",
  setUnlockWarningOpen,
  disableNextButton = false,
}: CreatorBottomButtonsProps) {
  return (
    <div className={classNames("flex mt-8", prevButtonString ? "justify-between" : "justify-end")}>
      {prevButtonString !== "" && (
        <SecondaryButton data-testid="prev-step-btn" onClick={prevStepFun}>
          {prevButtonString}
        </SecondaryButton>
      )}
      <div className="flex gap-2">
        {showLockSymbol && (
          <WarningButton data-testid="unlock-btn" onClick={() => setUnlockWarningOpen?.(true)}>
            <LockOpenIcon className="-ml-1 mr-2 h-4 w-4 text-yellow-700" aria-hidden="true" />
            Unlock
          </WarningButton>
        )}

        {nextButtonString !== "" && (
          <PrimaryButton disabled={disableNextButton} data-testid="next-step-btn" onClick={nextStepFun}>
            {nextButtonString}
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
