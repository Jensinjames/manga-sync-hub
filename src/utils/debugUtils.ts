
/**
 * Utility functions for debugging and testing the application
 */

interface TimelineSortResult {
  status: string;
  sorted: Array<{id: string; duration: number}>;
  valid: boolean;
}

interface ProjectValidationResult {
  status: string;
  hasId?: boolean;
  hasName?: boolean;
  hasPages?: boolean;
  pageCount: number;
  panelCount: number;
  valid: boolean;
}

/**
 * Test the timeline sorting functionality
 * @param panels Array of panels to test sorting on
 * @returns Object with test results
 */
export const testTimelineSorting = (panels: any[] = []): TimelineSortResult => {
  if (!panels || panels.length === 0) {
    return {
      status: 'No panels to test',
      sorted: [],
      valid: true
    };
  }
  
  try {
    // Create a copy for sorting
    const sortedPanels = [...panels].sort((a, b) => {
      // Sort by durationSec if available
      if (a.durationSec !== undefined && b.durationSec !== undefined) {
        return a.durationSec - b.durationSec;
      }
      
      // Fallback to timeCode
      const timeA = a.timeCode.split(':').map(Number);
      const timeB = b.timeCode.split(':').map(Number);
      return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });
    
    // Check if sorting is valid
    let isValid = true;
    let lastDuration = -1;
    
    for (const panel of sortedPanels) {
      const currentDuration = panel.durationSec || 0;
      if (currentDuration < lastDuration) {
        isValid = false;
        break;
      }
      lastDuration = currentDuration;
    }
    
    return {
      status: isValid ? 'Valid timeline sorting' : 'Invalid timeline sorting',
      sorted: sortedPanels.map(p => ({ id: p.id, duration: p.durationSec })),
      valid: isValid
    };
  } catch (error) {
    console.error('Error in timeline sorting test:', error);
    return {
      status: 'Error testing timeline',
      sorted: [],
      error: error instanceof Error ? error.message : String(error),
      valid: false
    };
  }
};

/**
 * Validate project data structure
 * @param project Project data to validate
 * @returns Object with validation results
 */
export const validateProjectStructure = (project: any): ProjectValidationResult => {
  if (!project) {
    return {
      status: 'Project is undefined',
      pageCount: 0,
      panelCount: 0,
      valid: false
    };
  }
  
  const results: ProjectValidationResult = {
    status: 'Project structure validation complete',
    hasId: Boolean(project.id),
    hasName: Boolean(project.name),
    hasPages: Boolean(project.pages && Array.isArray(project.pages)),
    pageCount: project.pages?.length || 0,
    panelCount: 0,
    valid: false
  };
  
  if (results.hasPages) {
    try {
      // Count total panels across all pages
      results.panelCount = project.pages.reduce(
        (count: number, page: any) => count + (page.panels?.length || 0), 
        0
      );
    } catch (error) {
      console.error('Error counting panels:', error);
    }
  }
  
  // Project structure is valid if it has basic required fields
  results.valid = results.hasId && results.hasName && results.hasPages;
  
  return results;
};

/**
 * Debug mode flag
 */
export const isDebugMode = (): boolean => {
  return localStorage.getItem('mangasync-debug-mode') === 'true';
};

/**
 * Toggle debug mode
 * @returns New debug mode state
 */
export const toggleDebugMode = (): boolean => {
  const currentMode = isDebugMode();
  localStorage.setItem('mangasync-debug-mode', currentMode ? 'false' : 'true');
  return !currentMode;
};
