import React, { useState } from 'react';
import { CenterSpec, ResourceRequest, ResourceOption, MdxSystemSpec } from '../types';
import { Cpu, Database, Server, TriangleAlert, Calculator, X, Info, Box, CheckSquare, Square } from 'lucide-react';
import { HPCI_SINGLE_CENTER_LIMIT } from '../constants';

interface CenterCardProps {
  center: CenterSpec;
  request: ResourceRequest;
  cost: number;
  onUpdate: (type: 'cpu' | 'gpu' | 'storage', optionId: string, value: number) => void;
  onToggleSelection?: (centerId: string) => void;
}

// Stats calculation for mdx packs
const MdxStatsPanel: React.FC<{
  packs: number;
  type: 'cpu' | 'gpu';
  specs: MdxSystemSpec;
}> = ({ packs, type, specs }) => {
  if (!packs || packs <= 0) return null;

  const packsPerNode = type === 'cpu' ? specs.cpuPacksPerNode : specs.gpuPacksPerNode;
  const coresPerNode = type === 'cpu' ? specs.cpuCoresPerNode : specs.gpuCoresPerNode;
  const memPerNode = type === 'cpu' ? specs.cpuMemoryPerNode : specs.gpuMemoryPerNode;
  
  // Calculations
  const nodeEquivalent = packs / packsPerNode;
  const totalCores = nodeEquivalent * coresPerNode;
  const totalMem = nodeEquivalent * memPerNode;
  const totalGpus = type === 'gpu' ? packs : 0; // 1 pack = 1 GPU usually
  
  // VMs: Min required (ceiling of node usage if considering full nodes, but packs are granular)
  const minVms = Math.ceil(packs / packsPerNode);

  return (
    <div className="mt-2 p-3 bg-purple-50 rounded-lg border border-purple-100 text-[11px] text-purple-900 animate-in fade-in duration-300">
      <div className="flex items-center gap-1.5 font-bold mb-2 pb-1 border-b border-purple-200 text-purple-800">
        <Box size={12} />
        Est. Hardware Allocation
      </div>
      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2">
        <div className="flex justify-between">
          <span className="text-purple-600">Equiv. Nodes:</span>
          <span className="font-bold">{nodeEquivalent.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-purple-600">Total Cores:</span>
            <span className="font-bold">{totalCores.toFixed(0)}</span>
        </div>
        <div className="flex justify-between">
            <span className="text-purple-600">Total Memory:</span>
            <span className="font-bold">{totalMem.toFixed(1)} GB</span>
        </div>
        {type === 'gpu' && (
          <div className="flex justify-between">
             <span className="text-purple-600">Total GPUs:</span>
             <span className="font-bold">{totalGpus} ({specs.gpuModelName})</span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-1 border-t border-purple-200">
          <div className="flex justify-between items-center text-purple-800">
            <span className="text-[10px] font-medium opacity-80">VM Constraints</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-purple-600">Max Packs / VM:</span>
            <span className="font-bold">{packsPerNode}</span>
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="text-purple-600">Min. VMs Req:</span>
            <span className="font-bold">{minVms}</span>
          </div>
      </div>
    </div>
  );
};

const ResourceRow: React.FC<{
  option: ResourceOption;
  value: number;
  onUpdate: (val: number) => void;
  unit: string;
  isCalcEnabled: boolean;
  isMdx: boolean;
  mdxSpecs?: MdxSystemSpec;
  resourceType: 'cpu' | 'gpu' | 'storage';
}> = ({ option, value, onUpdate, unit, isCalcEnabled, isMdx, mdxSpecs, resourceType }) => {
  const isOverLimit = !isMdx && value > option.limit; 
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
          {!isMdx && <span className="text-[10px] text-slate-400">¥{option.price}/{unit}</span>}
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

      {/* Mdx Detailed Stats */}
      {isMdx && mdxSpecs && resourceType !== 'storage' && value > 0 && (
          <MdxStatsPanel packs={value} type={resourceType as 'cpu' | 'gpu'} specs={mdxSpecs} />
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
  mdxSpecs?: MdxSystemSpec;
  resourceType: 'cpu' | 'gpu' | 'storage';
}> = ({ label, icon, options, selections, onUpdate, unit, isMdx, mdxSpecs, resourceType }) => {
  // Hide completely if no options available (User request for mdx storage)
  if (options.length === 0) {
    return null;
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
          mdxSpecs={mdxSpecs}
          resourceType={resourceType}
        />
      ))}
    </div>
  );
};

export const CenterCard: React.FC<CenterCardProps> = ({ center, request, cost, onUpdate, onToggleSelection }) => {
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
          <div className="flex-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800 leading-tight">{center.name}</h3>
                </div>
                
                {/* mdx Selection Checkbox */}
                {isMdx && onToggleSelection && (
                  <button 
                    onClick={() => onToggleSelection(center.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-bold transition-colors ${request.isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {request.isSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                    {request.isSelected ? 'Selected' : 'Select'}
                  </button>
                )}
            </div>
            
            <div className="flex gap-2 items-center mt-1">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${center.type === 'HPCI' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {center.type}
                </span>
                <p className="text-xs text-slate-500 truncate max-w-[150px]" title={center.description}>{center.description}</p>
            </div>
          </div>
          
          {/* Price / Limit Display */}
          {!isMdx && (
            <div className="text-right shrink-0 ml-4">
               <div className={`text-lg font-bold ${isCostOverLimit ? 'text-red-600' : 'text-slate-900'}`}>
                  ¥{cost.toLocaleString()}
               </div>
               {isCostOverLimit && (
                   <div className="flex items-center gap-1 text-[10px] text-red-600 font-medium justify-end">
                       <TriangleAlert size={12} />
                       > 3M Limit
                   </div>
               )}
            </div>
          )}
        </div>

        {/* Mdx System Specs Panel (Static info at top) */}
        {center.mdxSpecs && (
          <div className="mb-6 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-600 space-y-2">
             <div className="flex items-center gap-1.5 font-bold text-slate-700 border-b border-slate-200 pb-1 mb-1">
               <Info size={12} className="text-purple-600" />
               System Specifications
             </div>
             
             {/* CPU Specs */}
             <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
               <span className="font-semibold text-slate-500">CPU:</span>
               <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{center.mdxSpecs.totalCpuNodes} Nodes</span>
                  <span className="text-slate-500">{center.mdxSpecs.cpuNodeSpec}</span>
                  <span className="text-purple-600 font-semibold mt-0.5">Max Packs/VM: {center.mdxSpecs.cpuPacksPerNode}</span>
               </div>
             </div>

             {/* GPU Specs */}
             <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 mt-2 pt-2 border-t border-slate-100">
               <span className="font-semibold text-slate-500">GPU:</span>
               <div className="flex flex-col">
                  <span className="font-medium text-slate-700">{center.mdxSpecs.totalGpuNodes} Nodes</span>
                  <span className="text-slate-500">{center.mdxSpecs.gpuNodeSpec}</span>
                  <span className="text-purple-600 font-semibold mt-0.5">Max Packs/VM: {center.mdxSpecs.gpuPacksPerNode}</span>
               </div>
             </div>
          </div>
        )}

        <div className="flex-1">
          <ResourceInputGroup 
            label={isMdx ? "CPU (Packs)" : "CPU (Node-Hours)"}
            icon={<Cpu size={14} />} 
            options={center.cpuOptions} 
            selections={request.cpuSelections}
            onUpdate={(id, val) => onUpdate('cpu', id, val)}
            unit={isMdx ? "Pack" : "hr"}
            isMdx={isMdx}
            mdxSpecs={center.mdxSpecs}
            resourceType="cpu"
          />
          <ResourceInputGroup 
            label={isMdx ? "GPU (Packs)" : "GPU (GPU-Hours)"}
            icon={<Server size={14} />} 
            options={center.gpuOptions} 
            selections={request.gpuSelections}
            onUpdate={(id, val) => onUpdate('gpu', id, val)}
            unit={isMdx ? "Pack" : "hr"}
            isMdx={isMdx}
            mdxSpecs={center.mdxSpecs}
            resourceType="gpu"
          />
          <ResourceInputGroup 
            label="Storage (TB)" 
            icon={<Database size={14} />} 
            options={center.storageOptions} 
            selections={request.storageSelections}
            onUpdate={(id, val) => onUpdate('storage', id, val)}
            unit="TB"
            isMdx={isMdx}
            mdxSpecs={center.mdxSpecs}
            resourceType="storage"
          />
        </div>
      </div>
    </div>
  );
};
