import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { LockClosedIcon, ChevronLeftIcon } from "@heroicons/react/20/solid";
import { classNames } from "@frontend/utils/classNames";
import { NAVIGATION } from "@app/components/Navigation";
import { showLockSymbol } from "@app/creatorUtils";
import { selectCreation } from "@app/redux/selectors/creation";

interface MenuContentProps {
  currentStep: number;
  maxStep: number;
  setCurrentStep: (value: number) => void;
}

export function MenuContent({ currentStep, maxStep, setCurrentStep }: MenuContentProps) {
  const creation = useSelector(selectCreation);

  return (
    <>
      <div className="flex-1 overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <Link to="/">
            <img className="h-8 w-auto" src="/logo_horiz_inv.png" alt="Pabolo" />
          </Link>
        </div>

        <div className="flex flex-shrink-0 items-center mt-8 mx-3 p-3 cursor-default bg-gray-100 rounded-lg shadow-inner shadow-gray-500">
          <h1 className="text-gray-600">{creation?.title || "Unnamed Creation"}</h1>
        </div>

        <nav className="mt-6 space-y-1 px-2">
          {NAVIGATION.map((item, itemId) => (
            <div
              key={item.name}
              className={classNames(
                itemId == currentStep ? "bg-gray-900 text-white" : "",
                "group flex items-center px-2 py-2 text-base font-medium rounded-md",
                itemId <= maxStep && "cursor-pointer text-gray-300 hover:bg-gray-700 hover:text-white",
                itemId > maxStep && "text-gray-500"
              )}
              onClick={() => {
                if (itemId <= maxStep) {
                  setCurrentStep(itemId);
                }
              }}
            >
              <item.icon
                className={classNames(
                  itemId == currentStep && "text-gray-300",
                  itemId < maxStep && "text-gray-400 group-hover:text-gray-300",
                  "mr-4 flex-shrink-0 h-6 w-6"
                )}
                aria-hidden="true"
              />
              {item.name}
              {showLockSymbol(itemId, maxStep) && (
                <LockClosedIcon className="h-4 w-4 text-gray-400 ml-auto" aria-hidden="true" />
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex flex-shrink-0 bg-gray-700 p-4">
        <Link to="/creations" className="shrink truncate">
          <div className="ml-3 flex flex-row justify-center items-center gap-1 text-gray-300 hover:text-gray-100">
            <ChevronLeftIcon className="w-5 h-5" />
            <p className="text-sm font-medium">My Creations</p>
          </div>
        </Link>
      </div>
    </>
  );
}
