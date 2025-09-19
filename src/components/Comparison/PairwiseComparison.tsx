import React, { useState } from 'react';
import Button from '../UI/Button';

interface ComparisonPair {
  itemA: any;
  itemB: any;
  type: 'criteria' | 'alternatives';
  contextId?: string;
  contextName?: string;
}

interface PairwiseComparisonProps {
  pair: ComparisonPair;
  onSave: (value: number) => void;
  saving: boolean;
  currentIndex: number;
  totalPairs: number;
}

const SAATY_SCALE = [
  { value: 9, label: 'Extremely more important', description: 'The evidence favoring one criterion is of the highest possible order' },
  { value: 7, label: 'Very strongly more important', description: 'A criterion is strongly favored and its dominance is demonstrated in practice' },
  { value: 5, label: 'Strongly more important', description: 'Experience and judgment strongly favor one criterion' },
  { value: 3, label: 'Moderately more important', description: 'Experience and judgment slightly favor one criterion' },
  { value: 1, label: 'Equally important', description: 'Two criteria contribute equally to the objective' },
  { value: 1/3, label: 'Moderately less important', description: 'Experience and judgment slightly favor the other criterion' },
  { value: 1/5, label: 'Strongly less important', description: 'Experience and judgment strongly favor the other criterion' },
  { value: 1/7, label: 'Very strongly less important', description: 'The other criterion is strongly favored and its dominance is demonstrated' },
  { value: 1/9, label: 'Extremely less important', description: 'The evidence favoring the other criterion is of the highest possible order' },
];

export default function PairwiseComparison({
  pair,
  onSave,
  saving,
  currentIndex,
  totalPairs,
}: PairwiseComparisonProps) {
  const [selectedValue, setSelectedValue] = useState<number>(1);

  const handleSave = () => {
    onSave(selectedValue);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-sm text-gray-500 mb-2">
          Comparison {currentIndex} of {totalPairs}
          {pair.contextName && (
            <span className="ml-2 text-blue-600">
              (for {pair.contextName})
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Compare the importance of:
        </h2>
      </div>

      {/* Comparison Items */}
      <div className="grid grid-cols-3 gap-4 items-center">
        <div className="bg-blue-50 p-6 rounded-lg text-center border-2 border-blue-200">
          <h3 className="font-semibold text-blue-900 text-lg mb-2">
            {pair.itemA.name}
          </h3>
          {pair.itemA.description && (
            <p className="text-sm text-blue-700">{pair.itemA.description}</p>
          )}
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-400">VS</div>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg text-center border-2 border-green-200">
          <h3 className="font-semibold text-green-900 text-lg mb-2">
            {pair.itemB.name}
          </h3>
          {pair.itemB.description && (
            <p className="text-sm text-green-700">{pair.itemB.description}</p>
          )}
        </div>
      </div>

      {/* Scale Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 text-center">
          How important is <span className="text-blue-600">{pair.itemA.name}</span> compared to <span className="text-green-600">{pair.itemB.name}</span>?
        </h3>
        
        <div className="space-y-2">
          {SAATY_SCALE.map((scale) => (
            <label
              key={scale.value}
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedValue === scale.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="comparison"
                value={scale.value}
                checked={selectedValue === scale.value}
                onChange={(e) => setSelectedValue(parseFloat(e.target.value))}
                className="sr-only"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{scale.label}</span>
                  <span className="text-sm text-gray-500">
                    {scale.value < 1 ? `1/${Math.round(1/scale.value)}` : scale.value}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{scale.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center pt-4">
        <Button
          onClick={handleSave}
          loading={saving}
          size="lg"
          disabled={!selectedValue}
        >
          Save Comparison
        </Button>
      </div>
    </div>
  );
}