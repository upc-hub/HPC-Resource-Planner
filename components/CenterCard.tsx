import React, { useState } from 'react';
import { CenterSpec, ResourceRequest, ResourceOption } from '../types';
import { Cpu, Database, Server, TriangleAlert, Calculator, X } from 'lucide-react';
import { HPCI_SINGLE_CENTER_LIMIT } from '../constants';

interface CenterCardProps {
  center: CenterSpec;
  request: ResourceRequest;
  cost: number;
  onUpdate: (type: 'cpu' | 'gpu' | 'storage', optionId: string, value: number) => void;
}

const ResourceRow: React.FC<{
  option: ResourceOption;
  value: number;
  onUpdate: (val: number) => void;
  unit: string;
  isCalcEnabled: boolean;
  isMdx: boolean;
}> = ({ option, value, onUpdate, unit, isCalcEnabled, isMdx }) => {
  const isOverLimit = !isMdx && value > option.limit; // Don't flag limits for mdx
  const [showCalc, setShowCalc] = useState(false);
  const [parallelNodes, setParallelNodes] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(24);

  const durationDays = (value > 0 && parallelNodes > 0 && hoursPerDay > 0) 
    ? (value / (parallelNodes * hoursPerDay)) 
    : 0;

  return (
    <div className="relative mb-3 last:mb-0">
      <div className="flex justify-between items-center mb-1 px-1">
          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[65%]" title={option.name}>{option.name}</span>
          <span className="text-[10px] text-slate-400">¥{option.price}/{unit}</span>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
            <input
                type="number"
                min="0"
                value={value || ''}
                onChange={(e) => onUpdate(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors ${isOverLimit ? 'border-red-500 focus:ring-red-200 bg-red-50 text-red-900' : 'border-slate-300 focus:ring-indigo-500'}`}
                placeholder="0"
            />
        </div>
        {isCalcEnabled && (
           <button 
             onClick={() => setShowCalc(!showCalc)}
             className={`p-1.5 rounded-lg border transition-colors ${showCalc ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200'}`}
             title="Calculate Run Duration"
           >
             <Calculator size={16} />
           </button>
        )}
      </div>
      
      {!isMdx && (
        <div className="flex justify-between mt-0.5 px-1">
            <span className={`text-[10px] font-bold ${isOverLimit ? 'text-red-600' : 'text-slate-400'}`}>
                Max: {option.limit.toLocaleString()}
            </span>
        </div>
      )}

      {/* Calculator Panel */}
      {showCalc && isCalcEnabled && (
        <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs animate-in slide-in-from-top-2 duration-200">
           <div className="flex justify-between items-center mb-2">
             <span className="font-semibold text-slate-600 flex items-center gap-1"><Calculator size={10}/> Duration Calc</span>
             <button onClick={() => setShowCalc(false)} className="text-slate-400 hover:text-slate-600"><X size={12}/></button>
           </div>
           <div className="grid grid-cols-2 gap-2 mb-2">
             <div>
               <label className="block text-slate-500 mb-0.5 text-[10px]">Nodes/GPUs Used</label>
               <input 
                 type="number" 
                 min="1"
                 value={parallelNodes}
                 onChange={(e) => setParallelNodes(Math.max(1, parseFloat(e.target.value) || 0))}
                 className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
               />
             </div>
             <div>
               <label className="block text-slate-500 mb-0.5 text-[10px]">Hours/Day</label>
               <input 
                 type="number" 
                 min="1" 
                 max="24"
                 value={hoursPerDay}
                 onChange={(e) => setHoursPerDay(Math.min(24, Math.max(1, parseFloat(e.target.value) || 0)))}
                 className="w-full px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
               />
             </div>
           </div>
           <div className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center shadow-sm">
              <span className="text-slate-500">Run Duration:</span>
              <span className="font-bold text-indigo-600 text-sm">{durationDays.toLocaleString(undefined, {maximumFractionDigits: 1})} Days</span>
           </div>
        </div>
      )}
    </div>
  );
};

const ResourceInputGroup: React.FC<{
  label: string;
  icon: React.ReactNode;
  options: ResourceOption[];
  selections: Record<string, number>;
  onUpdate: (id: string, val: number) => void;
  unit: string;
  isMdx: boolean;
}> = ({ label, icon, options, selections, onUpdate, unit, isMdx }) => {
  if (options.length === 0) {
    return (
      <div className="opacity-50 pointer-events-none grayscale mb-4">
        <div className="flex justify-between items-end mb-1">
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            {icon} {label}
          </label>
          <span className="text-[10px] text-slate-400">N/A</span>
        </div>
        <div className="w-full px-3 py-2 text-sm border border-slate-200 bg-slate-50 rounded-lg text-slate-400">
           Not Available
        </div>
      </div>
    );
  }

  // Only enable calculator for time-based resources (node-hours, gpu-hours) and NOT mdx
  const isCalcEnabled = !isMdx && unit === 'hr';

  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-end">
        <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
          {icon} {label}
        </label>
        {options.length > 1 && <span className="text-[10px] text-slate-400">{options.length} types</span>}
      </div>
      
      {options.map((opt) => (
        <ResourceRow 
          key={opt.id}
          option={opt}
          value={selections[opt.id] || 0}
          onUpdate={(val) => onUpdate(opt.id, val)}
          unit={unit}
          isCalcEnabled={isCalcEnabled}
          isMdx={isMdx}
        />
      ))}
    </div>
  );
};

export const CenterCard: React.FC<CenterCardProps> = ({ center, request, cost, onUpdate }) => {
  const isCostOverLimit = center.type === 'HPCI' && cost > HPCI_SINGLE_CENTER_LIMIT;
  const isMdx = center.type === 'mdx';

  // Check for any limit violations (Ignore limits for mdx as they are unknown/flexible)
  const hasCpuError = !isMdx && center.cpuOptions.some(opt => (request.cpuSelections[opt.id] || 0) > opt.limit);
  const hasGpuError = !isMdx && center.gpuOptions.some(opt => (request.gpuSelections[opt.id] || 0) > opt.limit);
  const hasStorageError = !isMdx && center.storageOptions.some(opt => (request.storageSelections[opt.id] || 0) > opt.limit);
  const hasLimitError = hasCpuError || hasGpuError || hasStorageError;

  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 h-full flex flex-col ${isCostOverLimit || hasLimitError ? 'border-red-300 ring-2 ring-red-100' : 'border-slate-200 hover:border-indigo-300'}`}>
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">{center.name}</h3>
            </div>
            <div className="flex gap-2 items-center mt-1">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${center.type === 'HPCI' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {center.type}
                </span>
                <p className="text-xs text-slate-500 truncate max-w-[120px]" title={center.description}>{center.description}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
             <div className={`text-lg font-bold ${isCostOverLimit ? 'text-red-600' : 'text-slate-900'}`}>
                ¥{cost.toLocaleString()}
             </div>
             {isCostOverLimit && (
                 <div className="flex items-center gap-1 text-[10px] text-red-600 font-medium">
                     <TriangleAlert size={12} />
                     > 3M Limit
                 </div>
             )}
          </div>
        </div>

        <div className="flex-1">
          <ResourceInputGroup 
            label={isMdx ? "CPU (Packs)" : "CPU (Node-Hours)"}
            icon={<Cpu size={14} />} 
            options={center.cpuOptions} 
            selections={request.cpuSelections}
            onUpdate={(id, val) => onUpdate('cpu', id, val)}
            unit={isMdx ? "Pack" : "hr"}
            isMdx={isMdx}
          />
          <ResourceInputGroup 
            label={isMdx ? "GPU (Packs)" : "GPU (GPU-Hours)"}
            icon={<Server size={14} />} 
            options={center.gpuOptions} 
            selections={request.gpuSelections}
            onUpdate={(id, val) => onUpdate('gpu', id, val)}
            unit={isMdx ? "Pack" : "hr"}
            isMdx={isMdx}
          />
          <ResourceInputGroup 
            label="Storage (TB)" 
            icon={<Database size={14} />} 
            options={center.storageOptions} 
            selections={request.storageSelections}
            onUpdate={(id, val) => onUpdate('storage', id, val)}
            unit="TB"
            isMdx={isMdx}
          />
        </div>
      </div>
    </div>
  );
};