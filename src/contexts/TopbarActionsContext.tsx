'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TopbarActionsContextType {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const TopbarActionsContext = createContext<TopbarActionsContextType | undefined>(undefined);

export function TopbarActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);

  return (
    <TopbarActionsContext.Provider value={{ actions, setActions }}>
      {children}
    </TopbarActionsContext.Provider>
  );
}

export function useTopbarActions() {
  const context = useContext(TopbarActionsContext);
  if (!context) {
    throw new Error('useTopbarActions must be used within TopbarActionsProvider');
  }
  return context;
}
