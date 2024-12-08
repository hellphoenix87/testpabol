import { Bars3Icon } from "@heroicons/react/24/outline";

interface MobileHeaderProps {
  setSidebarOpen: (value: boolean) => void;
}

export function MobileHeader({ setSidebarOpen }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-gray-800 pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
      <button
        type="button"
        className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
    </div>
  );
}
