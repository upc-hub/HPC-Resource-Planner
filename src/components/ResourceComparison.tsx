import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CenterSpec } from '../types';
import { Cpu, Server, Database } from 'lucide-react';

interface ResourceComparisonProps {
  centers: CenterSpec[];
}

type ResourceType = 'cpu' | 'gpu' | 'storage';

// Consistent colors for HPCI centers
const CENTER_COLORS: Record<string, string> = {
  'hpci-hokkaido': '#ef4444', // Red
  'hpci-tohoku': '#f97316',   // Orange
  'hpci-tokyo': '#f59e0b',    // Amber
  'hpci-science-tokyo': '#84cc16', // Lime
  'hpci-nagoya': '#10b981',   // Emerald
  'hpci-osaka': '#06b6d4',    // Cyan
  'hpci-kyoto': '#3b82f6',    // Blue
  'hpci-kyushu': '#8b5cf6',   // Violet
};

export const ResourceComparison: React.FC<ResourceComparisonProps> = ({ centers }) => {
  const [activeTab, setActiveTab] = useState<ResourceType>('cpu');

  // Filter for HPCI only, then flatten the options
  const data = centers
    .filter(c => c.type === 'HPCI')
    .flatMap(center => {
      let options = [];
      if (activeTab === 'cpu') options = center.cpuOptions;
      else if (activeTab === 'gpu') options = center.gpuOptions;
      else options = center.storageOptions;

      return options.map(opt => ({
        id: opt.id,
        resourceName: opt.name,
        institutionName: center.name,
        shortInstName: center.name.replace("University", "").replace("Institute", "").replace("Science Tokyo (Tokyo Tech)", "Science Tokyo").trim(),
        limit: opt.limit,
        price: opt.price,
        color: CENTER_COLORS[center.id] || '#94a3b8',
        centerId: center.id
      }));
    });

  // Unique institutions present in the current data (for legend)
  const uniqueInstitutions = Array.from(new Set(data.map(d => d.centerId)))
    .map(id => {
      const item = data.find(d => d.centerId === id);
      return {
        id,
        name: item?.institutionName,
        color: item?.color
      };
    });

  const getUnitLabel = () => {
    switch (activeTab) {
      case 'cpu': return 'Node-Hours';
      case 'gpu': return 'GPU-Hours';
      case 'storage': return 'TB';
    }
  };

  const getPriceLabel = () => {
     switch (activeTab) {
      case 'cpu': return '¥ / Node-Hour';
      case 'gpu': return '¥ / GPU-Hour';
      case 'storage': return '¥ / TB';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm z-50">
          <p className="font-bold text-slate-800 mb-1">{data.institutionName}</p>
          <p className="text-slate-600 font-medium">{data.resourceName}</p>
          <div className="my-1 h-px bg-slate-100"></div>
          <p className="text-indigo-600">
            {payload[0].name === 'limit' ? 
              `Max: ${data.limit.toLocaleString()} ${activeTab === 'storage' ? 'TB' : ''}` : 
              `Fee: ¥${data.price.toLocaleString()}`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  // Helper to calculate domain max to avoid too much whitespace
  const calculateDomainMax = (dataMax: number) => {
      return Math.ceil(dataMax * 1.05); // Add 5% padding
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Institutional Comparison
        </h3>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('cpu')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'cpu' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Cpu size={16} /> CPU
          </button>
          <button 
             onClick={() => setActiveTab('gpu')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'gpu' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Server size={16} /> GPU
          </button>
          <button 
             onClick={() => setActiveTab('storage')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'storage' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Database size={16} /> Storage
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-6 px-4">
        {uniqueInstitutions.map(inst => (
          <div key={inst.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: inst.color }}></span>
            <span className="text-xs text-slate-600 font-medium">{inst.name}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[600px]">
        {/* Capacity Chart */}
        <div className="flex flex-col h-full">
          <h4 className="text-sm font-semibold text-slate-500 mb-4 text-center">Max Acceptable Quantity ({getUnitLabel()})</h4>
          <div className="flex-1 min-h-0">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="resourceName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    interval={0} 
                  />
                  <YAxis 
                    tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} 
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    domain={[0, calculateDomainMax]}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="limit" name="limit" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                No {activeTab.toUpperCase()} resources available in HPCI centers.
              </div>
            )}
          </div>
        </div>

        {/* Price Chart */}
        <div className="flex flex-col h-full">
           <h4 className="text-sm font-semibold text-slate-500 mb-4 text-center">Usage Fee ({getPriceLabel()})</h4>
           <div className="flex-1 min-h-0">
             {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="resourceName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80} 
                    tick={{fontSize: 10, fill: '#64748b'}} 
                    interval={0} 
                  />
                  <YAxis 
                    tick={{fontSize: 11, fill: '#64748b'}} 
                    tickFormatter={(val) => `¥${val}`} 
                    domain={[0, calculateDomainMax]}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="price" name="price" radius={[4, 4, 0, 0]}>
                    {data.map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                 No {activeTab.toUpperCase()} resources available in HPCI centers.
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};