import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ResultsChartProps {
  data: any;
  type: 'criteria' | 'alternatives';
}

const COLORS = ['#2563EB', '#DC2626', '#16A34A', '#CA8A04', '#9333EA', '#C2410C'];

export default function ResultsChart({ data, type }: ResultsChartProps) {
  const chartData = type === 'criteria' 
    ? data.criteriaWeights.map((item: any) => ({
        name: item.name,
        value: item.weight,
        percentage: (item.weight * 100).toFixed(1),
      }))
    : data.finalScores.map((item: any) => ({
        name: item.name,
        value: item.score,
        percentage: (item.score * 100).toFixed(1),
      }));

  const title = type === 'criteria' ? 'Criteria Importance' : 'Alternative Scores';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [
                  `${(value * 100).toFixed(2)}%`,
                  type === 'criteria' ? 'Weight' : 'Score'
                ]}
              />
              <Bar 
                dataKey="value" 
                fill={type === 'criteria' ? '#2563EB' : '#16A34A'}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}