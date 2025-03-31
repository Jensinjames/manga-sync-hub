
export interface MobileContextType {
  isMobile: boolean;
  isDrawerOpen: boolean;
  activeDrawer: 'pages' | 'notes' | null;
  openDrawer: (drawer: 'pages' | 'notes') => void;
  closeDrawer: () => void;
}
