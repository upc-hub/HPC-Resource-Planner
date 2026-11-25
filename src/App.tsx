
import React, { useState, useMemo } from 'react';
import { CENTERS as INITIAL_CENTERS, HPCI_TOTAL_LIMIT, MDX_TOTAL_LIMIT } from './constants';
import { ResourceRequest, CostBreakdown, CenterSpec, ResourceOption } from './types';
import { CenterCard } from './components/CenterCard';
import { CostChart } from './components/CostChart';
import { ResourceComparison } from './components/ResourceComparison';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal';
<<<<<<< HEAD:App.tsx
import { AiConsultantModal } from './components/AiConsultantModal';
import { LayoutDashboard, Wallet, Building2, AlertTriangle, CheckCircle2, Settings, CircleHelp, RotateCcw, Search, ShieldAlert, Heart, Sparkles } from 'lucide-react';
=======
import { LayoutDashboard, Wallet, Building2, AlertTriangle, CheckCircle2, Settings, CircleHelp, RotateCcw, Search, Cpu, Server } from 'lucide-react';
>>>>>>> Move app source into src:src/App.tsx

const App: React.FC = () => {
  // State for Center Definitions (Allows editing limits via Settings)
  const [centers, setCenters] = useState<CenterSpec[]>(INITIAL_CENTERS);

  // State for requests per center (initialized with empty maps)
  const [requests, setRequests] = useState<ResourceRequest[]>(() => 
    INITIAL_CENTERS.map(c => ({
      centerId: c.id,
      isSelected: false, 
      cpuSelections: {},
      gpuSelections: {},
      storageSelections: {}
    }))
  );

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [consultantCenter, setConsultantCenter] = useState<CenterSpec | null>(null);

  // Search Capability State
  const [searchReq, setSearchReq] = useState({ cpu: '', gpu: '' });

  // Capability Search Logic
  const highlightedCenterIds = useMemo(() => {
    const cpuVal = parseFloat(searchReq.cpu);
    const gpuVal = parseFloat(searchReq.gpu);
    
    if ((!searchReq.cpu && !searchReq.gpu) || (isNaN(cpuVal) && isNaN(gpuVal))) {
        return new Set<string>();
    }

    const matches = centers.filter(c => {
        let matchesCpu = true;
        if (cpuVal > 0) {
             matchesCpu = c.cpuOptions.some(opt => opt.limit >= cpuVal);
        }

<<<<<<< HEAD:App.tsx
        let matchesGpu = true;
        if (gpuVal > 0) {
            matchesGpu = c.gpuOptions.some(opt => opt.limit >= gpuVal);
        }

=======
  // Search Capability State
  const [searchReq, setSearchReq] = useState({ cpu: '', gpu: '' });

  // Capability Search Logic
  const highlightedCenterIds = useMemo(() => {
    const cpuVal = parseFloat(searchReq.cpu);
    const gpuVal = parseFloat(searchReq.gpu);
    
    // If input is invalid or empty, highlight nothing (empty set)
    if ((!searchReq.cpu && !searchReq.gpu) || (isNaN(cpuVal) && isNaN(gpuVal))) {
        return new Set<string>();
    }

    // Determine matching centers
    const matches = centers.filter(c => {
        let matchesCpu = true;
        if (cpuVal > 0) {
             // Check if ANY cpu option has a limit >= required
             matchesCpu = c.cpuOptions.some(opt => opt.limit >= cpuVal);
        }

        let matchesGpu = true;
        if (gpuVal > 0) {
            // Check if ANY gpu option has a limit >= required
            matchesGpu = c.gpuOptions.some(opt => opt.limit >= gpuVal);
        } else if (searchReq.gpu && gpuVal === 0) {
           // User explicitly typed 0, basically ignored but logic holds
        }

        // Must satisfy BOTH if both entered
>>>>>>> Move app source into src:src/App.tsx
        return matchesCpu && matchesGpu;
    }).map(c => c.id);

    return new Set(matches);
  }, [searchReq, centers]);


<<<<<<< HEAD:App.tsx
  // Calculate individual totals per center
=======
  // First pass: Calculate individual totals per center
>>>>>>> Move app source into src:src/App.tsx
  const rawCosts = useMemo(() => {
    return requests.map(req => {
      const center = centers.find(c => c.id === req.centerId);
      if (!center) return { centerId: req.centerId, type: 'HPCI' as const, cpuCost: 0, gpuCost: 0, storageCost: 0, total: 0 };
      
      let cpuCost = 0;
      center.cpuOptions.forEach(opt => {
        cpuCost += (req.cpuSelections[opt.id] || 0) * opt.price;
      });

      let gpuCost = 0;
      center.gpuOptions.forEach(opt => {
        gpuCost += (req.gpuSelections[opt.id] || 0) * opt.price;
      });

      let storageCost = 0;
      center.storageOptions.forEach(opt => {
        storageCost += (req.storageSelections[opt.id] || 0) * opt.price;
      });

      const total = cpuCost + gpuCost + storageCost;
      
      return {
        centerId: center.id,
        type: center.type,
        cpuCost,
        gpuCost,
        storageCost,
        total
      };
    });
  }, [requests, centers]);

  // Aggregate Totals
  const hpciTotal = useMemo(() => 
    rawCosts.filter(c => c.type === 'HPCI').reduce((sum, c) => sum + c.total, 0), 
  [rawCosts]);

  const mdxTotal = useMemo(() => {
    const isAnyMdxSelected = requests.some(r => {
      const c = centers.find(cent => cent.id === r.centerId);
      return c?.type === 'mdx' && r.isSelected;
    });
    return isAnyMdxSelected ? MDX_TOTAL_LIMIT : 0;
  }, [requests, centers]);

  const hpciOverTotalLimit = hpciTotal > HPCI_TOTAL_LIMIT;
  const mdxOverTotalLimit = mdxTotal > MDX_TOTAL_LIMIT;

  const costs: CostBreakdown[] = useMemo(() => {
    return rawCosts.map(c => {
      let isOverLimit = false;
      if (c.type === 'HPCI') {
        isOverLimit = c.total > 3000000;
      } else if (c.type === 'mdx') {
        isOverLimit = mdxOverTotalLimit; 
      }
      return {
        ...c,
        isOverLimit
      } as CostBreakdown;
    });
  }, [rawCosts, mdxOverTotalLimit]);

  // Handlers
  const handleRequestUpdate = (centerId: string, type: 'cpu'|'gpu'|'storage', optionId: string, value: number) => {
    setRequests(prev => prev.map(req => {
      if (req.centerId !== centerId) return req;
      const key = type === 'cpu' ? 'cpuSelections' : type === 'gpu' ? 'gpuSelections' : 'storageSelections';
      return { ...req, [key]: { ...req[key], [optionId]: value } };
    }));
  };

  const handleToggleSelection = (centerId: string) => {
    setRequests(prev => prev.map(req => 
      req.centerId === centerId ? { ...req, isSelected: !req.isSelected } : req
    ));
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all resource allocations?')) {
      const emptyRequests = centers.map(c => ({
        centerId: c.id,
        isSelected: false,
        cpuSelections: {},
        gpuSelections: {},
        storageSelections: {}
      }));
      setRequests(emptyRequests);
    }
  };

  const handleCenterUpdate = (centerId: string, type: 'cpu'|'gpu'|'storage', optionId: string, newLimit: number) => {
    setCenters(prev => prev.map(c => {
      if (c.id !== centerId) return c;
      const key = type === 'cpu' ? 'cpuOptions' : type === 'gpu' ? 'gpuOptions' : 'storageOptions';
      const updatedOptions = (c[key] as ResourceOption[]).map(opt => opt.id === optionId ? { ...opt, limit: newLimit } : opt);
      return { ...c, [key]: updatedOptions };
    }));
  };

  const handleApplyAiEstimate = (nodeHours: number, gpuHours: number) => {
    if (!consultantCenter) return;
    
    setRequests(prev => prev.map(req => {
      if (req.centerId !== consultantCenter.id) return req;
      
      const cpuOptId = consultantCenter.cpuOptions[0]?.id;
      const gpuOptId = consultantCenter.gpuOptions[0]?.id;
      
      const newCpuSelections = cpuOptId ? { ...req.cpuSelections, [cpuOptId]: nodeHours } : req.cpuSelections;
      const newGpuSelections = gpuOptId ? { ...req.gpuSelections, [gpuOptId]: gpuHours } : req.gpuSelections;
      
      return {
        ...req,
        cpuSelections: newCpuSelections,
        gpuSelections: newGpuSelections
      };
    }));
  };

  return (
<<<<<<< HEAD:App.tsx
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
=======
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 pb-6 font-sans">
>>>>>>> Move app source into src:src/App.tsx
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">
                        <LayoutDashboard size={20} />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-lg font-bold text-slate-900 leading-none">HPC Planner</h1>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Resource Optimization</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border transition-all duration-300 ${hpciOverTotalLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <Wallet size={14} className={hpciOverTotalLimit ? 'text-red-500' : 'text-slate-400'} />
                      <span className="text-sm font-bold font-mono">
                          ¥{(hpciTotal / 1000000).toFixed(2)}M
                      </span>
                      {hpciOverTotalLimit ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={handleReset} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Reset"><RotateCcw size={18} /></button>
                    <button onClick={() => setIsInfoOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Guide"><CircleHelp size={20} /></button>
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Settings"><Settings size={20} /></button>
                  </div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Top Section: Search & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Search size={16} /> Capability Search
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min CPU (Node-Hr)</label>
                      <input 
                        type="number" 
                        value={searchReq.cpu} 
                        onChange={e => setSearchReq(prev => ({ ...prev, cpu: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        placeholder="e.g. 50000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Min GPU (GPU-Hr)</label>
                      <input 
                        type="number" 
                        value={searchReq.gpu} 
                        onChange={e => setSearchReq(prev => ({ ...prev, gpu: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                        placeholder="e.g. 10000"
                      />
                    </div>
                  </div>
               </div>
               
               <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
                  <h3 className="text-xs font-bold text-indigo-200 mb-4 uppercase tracking-wider">Project Budget Status</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm opacity-80 font-medium">HPCI Limit (Total)</span>
                      <span className="text-lg font-bold">¥3.6M</span>
                    </div>
                    <div className="h-2 bg-indigo-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${hpciOverTotalLimit ? 'bg-red-400' : 'bg-white'}`}
                        style={{ width: `${Math.min((hpciTotal / HPCI_TOTAL_LIMIT) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                      <span>{Math.min((hpciTotal / HPCI_TOTAL_LIMIT) * 100, 100).toFixed(0)}% Utilized</span>
                      {hpciOverTotalLimit && <span className="text-red-300">EXCEEDED</span>}
                    </div>
                  </div>
               </div>
            </div>
<<<<<<< HEAD:App.tsx
            
            <div className="lg:col-span-2">
               <CostChart costs={costs} />
=======
        </section>

        {/* Comparison Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <ResourceComparison centers={centers} />
        </section>

        {/* Main Grid: Centers */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {/* Header with Search Capability */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
               <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">Resource Allocation</h2>
                    <div className="h-px w-8 bg-slate-300"></div>
                </div>
                
                {/* Search Bar */}
                <div className="flex flex-1 max-w-2xl bg-white p-2 rounded-xl border border-slate-200 shadow-sm items-center gap-2">
                    <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0">
                        <Search size={18} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <div className="relative flex-1 group">
                             <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500">
                                <Cpu size={14} />
                             </div>
                             <input 
                                type="number" 
                                min="0" 
                                placeholder="Req. CPU Node-Hours" 
                                className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 border-0 rounded-md focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-400"
                                value={searchReq.cpu}
                                onChange={(e) => setSearchReq(prev => ({ ...prev, cpu: e.target.value }))}
                             />
                        </div>
                        <div className="relative flex-1 group">
                             <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500">
                                <Server size={14} />
                             </div>
                             <input 
                                type="number" 
                                min="0" 
                                placeholder="Req. GPU Hours" 
                                className="w-full pl-8 pr-2 py-1.5 text-sm bg-slate-50 border-0 rounded-md focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-400"
                                value={searchReq.gpu}
                                onChange={(e) => setSearchReq(prev => ({ ...prev, gpu: e.target.value }))}
                             />
                        </div>
                    </div>
                    {highlightedCenterIds.size > 0 && (
                        <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md shrink-0 animate-in fade-in">
                            {highlightedCenterIds.size} Found
                        </div>
                    )}
                </div>

                {/* Helper Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                   <button 
                      onClick={() => setIsInfoOpen(true)}
                      className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                   >
                     <CircleHelp size={14} /> Help
                   </button>
                   <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                   >
                     <Settings size={14} /> Limits
                   </button>
                 </div>
>>>>>>> Move app source into src:src/App.tsx
            </div>
          </div>

<<<<<<< HEAD:App.tsx
          {/* Institutional Comparison Component */}
          <ResourceComparison centers={centers} />
=======
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {centers.map(center => {
                    // Safe access with fallback in case of state timing issues
                    const req = requests.find(r => r.centerId === center.id) || {
                        centerId: center.id,
                        cpuSelections: {},
                        gpuSelections: {},
                        storageSelections: {}
                    };
                    const costData = costs.find(c => c.centerId === center.id) || {
                        centerId: center.id,
                        cpuCost: 0,
                        gpuCost: 0,
                        storageCost: 0,
                        total: 0,
                        isOverLimit: false
                    };
                    
                    return (
                        <CenterCard
                            key={`${center.id}-${resetKey}`} // FORCE REMOUNT ON RESET
                            center={center}
                            request={req}
                            cost={costData.total}
                            // Pass down check for mdx overall limit or HPCI single limit
                            onUpdate={(type, optId, val) => handleRequestUpdate(center.id, type, optId, val)}
                            onToggleSelection={center.type === 'mdx' ? handleToggleSelection : undefined}
                            isHighlighted={highlightedCenterIds.has(center.id)}
                        />
                    );
                })}
            </div>
        </section>
>>>>>>> Move app source into src:src/App.tsx

          {/* Center Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {centers.map(center => (
              <CenterCard 
                key={center.id}
                center={center}
                request={requests.find(r => r.centerId === center.id)!}
                cost={costs.find(c => c.centerId === center.id)?.total || 0}
                onUpdate={(type, optionId, value) => handleRequestUpdate(center.id, type, optionId, value)}
                onToggleSelection={center.type === 'mdx' ? handleToggleSelection : undefined}
                isHighlighted={highlightedCenterIds.has(center.id)}
                onOpenConsultant={() => setConsultantCenter(center)}
              />
            ))}
          </div>
        </div>
      </main>

<<<<<<< HEAD:App.tsx
      <footer className="bg-white border-t border-slate-200 p-8 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldAlert size={16} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Independent Planner Tool</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 font-medium text-xs">
             Made with <Heart size={12} className="text-red-400 fill-red-400" /> for the HPC Community
          </div>
        </div>
      </footer>

      {/* Modals */}
=======
      {/* Footer */}
<footer className="max-w-7xl mx-auto px-4 py-6 text-center text-xs text-white
                   bg-gradient-to-br from-purple-600 to-indigo-700
                   rounded-t-2xl border-t border-purple-500/30 shadow-sm">
  <p className="opacity-95">
    This site is an independent resource planning tool.
  </p>
  <p className="opacity-90">
    CPU/GPU costs are approximate values estimated from publicly available HPCI/JHPCN FY2026 call documents and user reports.
  </p>
  <p className="opacity-90">
    This site is not an official HPCI/JHPCN service.
  </p>
  <p className="mt-2 opacity-80">
    &copy; {new Date().getFullYear()} HPC Resource Planner. Created by{" "}
    <span className="font-semibold">Hein Htet</span>.
  </p>
</footer>

      {/* Settings Modal */}
>>>>>>> Move app source into src:src/App.tsx
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        centers={centers}
        onUpdateCenter={handleCenterUpdate}
      />
      <InfoModal 
        isOpen={isInfoOpen} 
        onClose={() => setIsInfoOpen(false)} 
      />
      {consultantCenter && (
        <AiConsultantModal
          isOpen={!!consultantCenter}
          onClose={() => setConsultantCenter(null)}
          center={consultantCenter}
          onApply={handleApplyAiEstimate}
        />
      )}
    </div>
  );
};

export default App;