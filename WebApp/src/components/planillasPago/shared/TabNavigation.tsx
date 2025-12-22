// WebApp/src/components/planillasPago/shared/TabNavigation.tsx

import React from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="border-b mt-4 bg-gray-50">
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-3 py-2 text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
              ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white border-b-2 border-blue-700 shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
