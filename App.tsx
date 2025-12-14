import React, { useState, useMemo } from 'react';
import { CENTERS as INITIAL_CENTERS, HPCI_TOTAL_LIMIT, MDX_TOTAL_LIMIT } from './constants';
import { ResourceRequest, CostBreakdown, CenterSpec } from './types';
import { CenterCard } from './components/CenterCard';
import { CostChart } from './components/CostChart';
import { ResourceComparison } from './components/ResourceComparison';
import { SettingsModal } from './components/SettingsModal';
import { InfoModal } from './components/InfoModal';
import { LayoutDashboard, Wallet, Building2, AlertTriangle, CheckCircle2, Settings, CircleHelp, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  // State for Center Definitions (Allows editing limits via Settings)
  const [centers, setCenters] = useState<CenterSpec[]>(INITIAL_CENTERS);

  // State for requests per center (initialized with empty maps)
  const [requests, setRequests] = useState<ResourceRequest[]>(() => 
    INITIAL_CENTERS.map(c => ({
      centerId: c.id,
      isSelected: false, // Default unselected (mostly for mdx)
      cpuSelections: {},
      gpuSelections: {},
      storageSelections: {}
    }))
  );

  // Reset Key: Used to force re-render of components on reset to ensure inputs clear thoroughly
  const [resetKey, setResetKey] = useState(0);

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  // First pass: Calculate individual totals per center
  const rawCosts = useMemo(() => {
    return requests.map(req => {
      const center = centers.find(c => c.id === req.centerId);
      // Guard clause in case centers state and requests state drift (shouldn't happen)
      if (!center) return { centerId: req.centerId, type: 'HPCI', cpuCost: 0, gpuCost: 0, storageCost: 0, total: 0 };
      
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

  // mdx Total Logic: If any mdx center is "Selected", cost becomes the full limit (1M flat fee assumption)
  const mdxTotal = useMemo(() => {
    const isAnyMdxSelected = requests.some(r => {
      const c = centers.find(cent => cent.id === r.centerId);
      return c?.type === 'mdx' && r.isSelected;
    });
    return isAnyMdxSelected ? MDX_TOTAL_LIMIT : 0;
  }, [requests, centers]);

  const hpciOverTotalLimit = hpciTotal > HPCI_TOTAL_LIMIT;
  const mdxOverTotalLimit = mdxTotal > MDX_TOTAL_LIMIT; // Should ideally equal limit if selected

  // Final Costs with OverLimit flags based on context
  const costs: CostBreakdown[] = useMemo(() => {
    return rawCosts.map(c => {
      let isOverLimit = false;
      if (c.type === 'HPCI') {
        isOverLimit = c.total > 3000000; // HPCI Single Center Limit
      } else if (c.type === 'mdx') {
        // For mdx individual cards, we don't show limit errors usually as it's a shared pool
        isOverLimit = mdxOverTotalLimit; 
      }
      return {
        ...c, // Spread 'any' inferred type safely
        isOverLimit
      } as CostBreakdown;
    });
  }, [rawCosts, mdxOverTotalLimit]);

  // Handle Request Updates
  const handleRequestUpdate = (centerId: string, type: 'cpu'|'gpu'|'storage', optionId: string, value: number) => {
    setRequests(prev => prev.map(req => {
      if (req.centerId !== centerId) return req;
      
      const key = type === 'cpu' ? 'cpuSelections' : type === 'gpu' ? 'gpuSelections' : 'storageSelections';
      return {
        ...req,
        [key]: {
          ...req[key],
          [optionId]: value
        }
      };
    }));
  };

  // Handle mdx Selection Toggle
  const handleToggleSelection = (centerId: string) => {
    setRequests(prev => prev.map(req => 
      req.centerId === centerId ? { ...req, isSelected: !req.isSelected } : req
    ));
  };

  // Handle Global Reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all resource allocations?')) {
      // 1. Reset Request State
      const emptyRequests = centers.map(c => ({
        centerId: c.id,
        isSelected: false,
        cpuSelections: {},
        gpuSelections: {},
        storageSelections: {}
      }));
      setRequests(emptyRequests);
      
      // 2. Increment Reset Key to force component unmount/remount
      // This ensures any local state in sub-components (like inputs) is completely wiped
      setResetKey(prev => prev + 1);
    }
  };

  // Handle Center Config Updates (Limits) from Settings Modal
  const handleCenterUpdate = (centerId: string, type: 'cpu'|'gpu'|'storage', optionId: string, newLimit: number) => {
    setCenters(prev => prev.map(c => {
      if (c.id !== centerId) return c;
      
      const key = type === 'cpu' ? 'cpuOptions' : type === 'gpu' ? 'gpuOptions' : 'storageOptions';
      const updatedOptions = c[key].map(opt => opt.id === optionId ? { ...opt, limit: newLimit } : opt);
      
      return { ...c, [key]: updatedOptions };
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 pb-6 font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-2 rounded-xl text-white shadow-md shadow-indigo-200">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">HPC Resource Planner</h1>
                        <p className="text-xs text-slate-500 font-medium">HPCI & mdx Allocation Tool</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Total Budget Indicator */}
                  <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border shadow-sm transition-colors duration-300 ${hpciOverTotalLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <Wallet size={16} className={hpciOverTotalLimit ? 'text-red-500' : 'text-slate-400'} />
                      <div className="flex flex-col items-end leading-none">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">HPCI Total Budget</span>
                          <span className="text-sm font-bold font-mono">
                              ¥{(hpciTotal / 1000000).toFixed(2)}M <span className="text-slate-400 font-sans font-normal text-xs">/ ¥3.60M</span>
                          </span>
                      </div>
                      {hpciOverTotalLimit ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                  </div>

                  <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={handleReset}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Reset All Allocations"
                    >
                      <RotateCcw size={18} />
                    </button>
                    <button 
                      onClick={() => setIsInfoOpen(true)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Infrastructure Info"
                    >
                      <CircleHelp size={20} />
                    </button>
                    <button 
                      onClick={() => setIsSettingsOpen(true)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Configure Limits"
                    >
                      <Settings size={20} />
                    </button>
                  </div>
                </div>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Section: Visualization */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2">
                <CostChart costs={costs} />
            </div>
            
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Building2 className="text-indigo-600" size={20}/> 
                    Infrastructure Summary
                </h3>
                
                <div className="space-y-8">
                    {/* HPCI Summary */}
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-600">HPCI Total Usage</span>
                            <span className={hpciOverTotalLimit ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                                {((hpciTotal / HPCI_TOTAL_LIMIT) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                            <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${hpciOverTotalLimit ? 'bg-red-500' : 'bg-indigo-600'}`} 
                                style={{ width: `${Math.min((hpciTotal / HPCI_TOTAL_LIMIT) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-slate-400">Limit: ¥3,600,000</p>
                            <p className={`text-xs font-bold font-mono ${hpciOverTotalLimit ? 'text-red-600' : 'text-slate-600'}`}>¥{hpciTotal.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        {/* mdx Summary */}
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium text-slate-600">mdx Total Usage (I & II)</span>
                            <span className={mdxOverTotalLimit ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                                {((mdxTotal / MDX_TOTAL_LIMIT) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                             <div 
                                className={`h-full rounded-full transition-all duration-700 ease-out ${mdxOverTotalLimit ? 'bg-red-500' : 'bg-purple-600'}`} 
                                style={{ width: `${Math.min((mdxTotal / MDX_TOTAL_LIMIT) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-slate-400">Limit: ¥1,000,000</p>
                            <p className={`text-xs font-bold font-mono ${mdxOverTotalLimit ? 'text-red-600' : 'text-slate-600'}`}>¥{mdxTotal.toLocaleString()}</p>
                        </div>
                         <div className="mt-4 p-3 bg-purple-50 text-purple-900 rounded-lg text-xs leading-relaxed border border-purple-100">
                            <strong>Note:</strong> mdx resources share a 1M JPY budget. Activate them using the toggle on the mdx cards below.
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Comparison Section */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
          <ResourceComparison centers={centers} />
        </section>

        {/* Main Grid: Centers */}
        <section className="animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-xl font-bold text-slate-900">Resource Allocation</h2>
                 <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent"></div>
                 <div className="flex items-center gap-2">
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
                     <Settings size={14} /> Configure Limits
                   </button>
                 </div>
            </div>

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
                        />
                    );
                })}
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400 text-xs border-t border-slate-200/50">
        <p>&copy; {new Date().getFullYear()} HPC Resource Planner. Created by <span className="font-bold text-slate-600">Hein Htet</span>. All rights reserved.</p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        centers={centers}
        onUpdateCenter={handleCenterUpdate}
      />
      
      {/* Info Modal */}
      <InfoModal 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
      />
    </div>
  );
};

export default App;