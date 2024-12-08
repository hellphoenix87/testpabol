import { classNames } from "@frontend/utils/classNames";

interface TabBarProps {
  currentTab: number;
  setCurrentTab: (tabId: number) => void;
  tabs: Array<{ name: string; icon: any }>;
}

export function TabBar({ currentTab, setCurrentTab, tabs }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 mb-6 mt-4">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab, tabId) => (
          <div
            key={tab.name}
            className={classNames(
              tabId === currentTab
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm cursor-pointer"
            )}
            aria-current={tabId == currentTab ? "page" : undefined}
            onClick={() => setCurrentTab(tabId)}
          >
            <tab.icon
              className={classNames(
                tabId == currentTab ? "text-indigo-500" : "text-gray-400 group-hover:text-gray-500",
                "-ml-0.5 mr-2 h-5 w-5"
              )}
              aria-hidden="true"
            />
            <span>{tab.name}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}
