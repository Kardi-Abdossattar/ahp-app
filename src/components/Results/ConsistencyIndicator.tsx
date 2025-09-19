import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface ConsistencyIndicatorProps {
  ratio: number;
  showLabel?: boolean;
}

export default function ConsistencyIndicator({ ratio, showLabel = false }: ConsistencyIndicatorProps) {
  const isConsistent = ratio <= 0.1;

  return (
    <div className="flex items-center space-x-2">
      {isConsistent ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <AlertTriangle className="h-4 w-4 text-red-500" />
      )}
      <span className={`text-sm font-medium ${isConsistent ? 'text-green-600' : 'text-red-600'}`}>
        {showLabel ? (isConsistent ? 'Good' : 'Poor') : ratio.toFixed(4)}
      </span>
    </div>
  );
}