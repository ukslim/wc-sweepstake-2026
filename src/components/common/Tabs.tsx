import { Tab } from '../../types';

interface TabsProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: 'groups', label: 'Group Stage' },
  { id: 'knockout', label: 'Knockout' },
  { id: 'calendar', label: 'Calendar' },
];

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <nav className="flex border-b border-gray-700">
      {tabs.map((tab) => (
        <button
          className={`px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-gold text-gold'
              : 'text-gray-400 hover:text-white'
          }`}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
