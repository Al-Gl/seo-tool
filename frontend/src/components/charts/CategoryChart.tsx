import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreBreakdown } from '@/types';

interface CategoryChartProps {
  data: ScoreBreakdown[];
  height?: number;
}

export function CategoryChart({ data, height = 300 }: CategoryChartProps) {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900 capitalize">{label}</p>
          <p className="text-sm text-primary-600">
            Score: {data.score}/{data.maxScore}
          </p>
          <p className="text-sm text-gray-600">
            Issues: {data.issues}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate percentage for each category
  const processedData = data.map(item => ({
    ...item,
    percentage: (item.score / item.maxScore) * 100,
  }));

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={processedData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="category"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="percentage" 
            radius={[4, 4, 0, 0]}
            fill={(entry: any) => {
              const percentage = entry.percentage;
              if (percentage >= 80) return '#22c55e';
              if (percentage >= 60) return '#f59e0b';
              return '#ef4444';
            }}
          >
            {processedData.map((entry, index) => (
              <Bar 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}