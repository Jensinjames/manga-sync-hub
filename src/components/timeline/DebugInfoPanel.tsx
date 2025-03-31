
import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface DebugInfoPanelProps {
  projectValidation: {
    valid: boolean;
    pageCount: number;
    panelCount: number;
  };
  sortingTestResults: {
    status: string;
    sorted: Array<any>;
  };
  project: any;
}

export const DebugInfoPanel: React.FC<DebugInfoPanelProps> = ({
  projectValidation,
  sortingTestResults,
  project
}) => {
  return (
    <div className="mb-4 p-3 bg-amber-900/30 border border-amber-800/50 rounded-md text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-amber-300 font-medium">Debug Information</h3>
        <div className="flex items-center">
          {projectValidation.valid ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h4 className="text-amber-200 font-semibold">Project Structure:</h4>
          <ul className="list-disc list-inside text-amber-100/80">
            <li>Project ID: {project?.id || 'Missing'}</li>
            <li>Pages: {projectValidation.pageCount}</li>
            <li>Panels: {projectValidation.panelCount}</li>
            <li>Structure valid: {projectValidation.valid ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-amber-200 font-semibold">Timeline Sorting:</h4>
          <p className="text-amber-100/80">Status: {sortingTestResults.status}</p>
          <p className="text-amber-100/80">Sorted panels: {sortingTestResults.sorted?.length || 0}</p>
        </div>
      </div>
    </div>
  );
};
