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
    <div className="h-96 w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
      <h3 className="text-sm font-bold text-slate-500 mb-6 uppercase tracking-wider flex items-center gap-2 shrink-0">
        <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
        HPCI Cost Distribution (Excl. mdx)
      </h3>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              tickFormatter={(value) => `¥${(value / 1000000).toFixed(1)}M`} 
              tick={{fontSize: 11, fill: '#94a3b8'}}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={130} 
              tick={{fontSize: 11, fill: '#64748b', fontWeight: 500}} 
              interval={0} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              formatter={(value: number) => [`¥${value.toLocaleString()}`, undefined]}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 500 }}
              cursor={{fill: '#f8fafc'}}
            />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}/>
            <Bar dataKey="CPU" stackId="a" fill="#6366f1" radius={[0, 4, 4, 0]} name="CPU Cost" barSize={20} />
            <Bar dataKey="GPU" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} name="GPU Cost" barSize={20} />
            <Bar dataKey="Storage" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} name="Storage Cost" barSize={20} />
            <ReferenceLine x={HPCI_SINGLE_CENTER_LIMIT} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '3M Limit', position: 'insideTopRight', fill: '#ef4444', fontSize: 10, fontWeight: 700 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};