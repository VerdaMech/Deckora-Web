import { useState } from 'react';

function Tab() {
  return null;
}

/**
 * @param {{ activeKey?: string, onSelect?: (key: string) => void, children: React.ReactNode }} props
 */
function Tabs({ activeKey: controlledKey, onSelect, children }) {
  const tabs = [];
  const childArray = Array.isArray(children) ? children : [children];
  childArray.forEach((child) => {
    if (child?.type === Tab) tabs.push(child);
  });

  const [internalKey, setInternalKey] = useState(tabs[0]?.props?.eventKey ?? '');
  const active = controlledKey ?? internalKey;

  const handleSelect = (key) => {
    if (!controlledKey) setInternalKey(key);
    onSelect?.(key);
  };

  const activeTab = tabs.find((t) => t.props.eventKey === active) ?? tabs[0];

  return (
    <div className="tabs-deckora">
      <div className="tabs-nav" role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.props.eventKey === active;
          return (
            <button
              key={tab.props.eventKey}
              role="tab"
              aria-selected={isActive}
              className={`tabs-nav__btn${isActive ? ' tabs-nav__btn--active' : ''}`}
              onClick={() => handleSelect(tab.props.eventKey)}
            >
              {tab.props.label}
            </button>
          );
        })}
      </div>
      <div className="tabs-content">{activeTab?.props?.children}</div>
    </div>
  );
}

Tabs.Tab = Tab;

export default Tabs;
