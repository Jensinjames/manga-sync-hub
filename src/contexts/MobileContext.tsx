
import React, { createContext, useState, useContext, useEffect } from 'react';
import { MobileContextType } from './types/MobileContextTypes';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export const useMobile = (): MobileContextType => {
  const context = useContext(MobileContext);
  if (!context) {
    throw new Error('useMobile must be used within a MobileProvider');
  }
  return context;
};

export const MobileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeDrawer, setActiveDrawer] = useState<'pages' | 'notes' | null>(null);

  const openDrawer = (drawer: 'pages' | 'notes') => {
    setActiveDrawer(drawer);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Close drawer when switching from mobile to desktop
  useEffect(() => {
    if (!isMobile) {
      setIsDrawerOpen(false);
      setActiveDrawer(null);
    }
  }, [isMobile]);

  return (
    <MobileContext.Provider value={{ 
      isMobile, 
      isDrawerOpen, 
      activeDrawer,
      openDrawer, 
      closeDrawer 
    }}>
      {children}
    </MobileContext.Provider>
  );
};
