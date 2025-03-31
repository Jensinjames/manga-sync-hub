
import React from 'react';
import { PanelLabel } from '@/contexts/pipeline/types';

interface DebugOverlayProps {
  labels: PanelLabel[];
  width: number;
  height: number;
}

const getLabelColor = (label: string) => {
  if (label.includes('face')) return 'rgba(255, 0, 0, 0.5)'; // Red
  if (label.includes('text')) return 'rgba(0, 0, 255, 0.5)'; // Blue
  if (label.includes('body') || label.includes('person')) return 'rgba(0, 255, 0, 0.5)'; // Green
  if (label.includes('effect')) return 'rgba(255, 255, 0, 0.5)'; // Yellow
  return 'rgba(255, 165, 0, 0.5)'; // Orange (default)
};

export const DebugOverlay: React.FC<DebugOverlayProps> = ({ labels, width, height }) => {
  if (!labels || labels.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {labels.map((label, index) => {
        const color = getLabelColor(label.label);
        return (
          <div 
            key={index}
            style={{
              position: 'absolute',
              left: `${label.x * 100}%`,
              top: `${label.y * 100}%`,
              width: `${label.width * 100}%`,
              height: `${label.height * 100}%`,
              border: `2px solid ${color}`,
              backgroundColor: `${color.slice(0, -4)}, 0.15)`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            <span style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              fontSize: '10px',
              padding: '2px 4px',
              borderRadius: '4px',
              transform: 'translateY(-100%)',
              marginTop: '-2px',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {label.label} ({Math.round(label.confidence * 100)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
};
