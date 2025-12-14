import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CostBreakdown } from '../types';
import { CENTERS, HPCI_SINGLE_CENTER_LIMIT } from '../constants';

interface CostChartProps {
  costs: CostBreakdown[];
}

export const CostChart: React.FC<CostChartProps> = ({ costs }) => {
  // Filter only HPCI centers
  const data = costs
    .filter(cost => {
      const center = CENTERS.find(c => c.id === cost.centerId);
      return center?.type === 'HPCI';
    })
    .map(cost => {
      const center = CENTERS.find(c => c.id === cost.centerId);
      // Abbreviate names for better fit
      const name = center?.name
        .replace("University", "Univ.")
        .replace("Institute", "Inst.")
        .replace("Science Tokyo (Tokyo Tech)", "Science Tokyo") || cost.centerId;
        
      return {
        name: name,
        CPU: cost.cpuCost,
        GPU: cost.gpuCost,
        Storage: cost.storageCost,
        Total: cost.total,
        limit: HPCI_SINGLE_CENTER_LIMIT
      };
    });

  return (
    <div className="h-96 w-full bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <h3 className="text-sm font-semibold text-slate-500 mb-4 uppercase tracking-wide">HPCI Cost Distribution (Excl. mdx)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} />
          {/* interval={0} ensures all labels are shown. width increased for longer names. */}
          <YAxis dataKey="name" type="category" width={130} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
          <Tooltip 
            formatter={(value: number) => `¥${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            cursor={{fill: '#f1f5f9'}}
          />
          <Legend />
          <Bar dataKey="CPU" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="CPU Cost" />
          <Bar dataKey="GPU" stackId="a" fill="#8b5cf6" radius={[0, 0, 0, 0]} name="GPU Cost" />
          <Bar dataKey="Storage" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name="Storage Cost" />
          <ReferenceLine x={HPCI_SINGLE_CENTER_LIMIT} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '3M Limit', position: 'insideTopRight', fill: '#ef4444', fontSize: 10 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};