import React, { useState, useMemo } from 'react';
import { CENTERS as INITIAL_CENTERS, HPCI_TOTAL_LIMIT, MDX_TOTAL_LIMIT } from './constants';
import { ResourceRequest, CostBreakdown, CenterSpec } from './types';
import { CenterCard } from './components/CenterCard';
import { CostChart } from './components/CostChart';
import { ResourceComparison } from './components/ResourceComparison';
import { SettingsModal } from './components/SettingsModal';
import { LayoutDashboard, Wallet, Building2, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

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

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // First pass: Calculate individual totals per center
  const rawCosts = useMemo(() => {
    return requests.map(req => {
      const center = centers.find(c => c.id === req.centerId)!;
      
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
        ...c,
        isOverLimit
      };
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
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <div className="flex items-center gap-2">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white">
                        <LayoutDashboard size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 leading-tight">HPC Resource Planner</h1>
                        <p className="text-xs text-slate-500">HPCI & mdx Allocation Tool</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Total Budget Indicator */}
                  <div className={`hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border ${hpciOverTotalLimit ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-700'}`}>
                      <Wallet size={16} className={hpciOverTotalLimit ? 'text-red-500' : 'text-slate-400'} />
                      <div className="flex flex-col items-end leading-none">
                          <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">HPCI Total Budget</span>
                          <span className="text-sm font-bold">
                              ¥{(hpciTotal / 1000000).toFixed(2)}M / ¥3.60M
                          </span>
                      </div>
                      {hpciOverTotalLimit ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} className="text-emerald-500" />}
                  </div>

                  {/* Settings Button */}
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Section: Visualization */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <CostChart costs={costs} />
            </div>
            
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 className="text-indigo-600" size={20}/> 
                    Infrastructure Summary
                </h3>
                
                <div className="space-y-6">
                    {/* HPCI Summary */}
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-600">HPCI Total Usage</span>
                            <span className={hpciOverTotalLimit ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                                {((hpciTotal / HPCI_TOTAL_LIMIT) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-500 ${hpciOverTotalLimit ? 'bg-red-500' : 'bg-indigo-600'}`} 
                                style={{ width: `${Math.min((hpciTotal / HPCI_TOTAL_LIMIT) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                            <p className="text-xs text-slate-400">Limit: ¥3,600,000</p>
                            <p className={`text-xs font-bold ${hpciOverTotalLimit ? 'text-red-600' : 'text-slate-600'}`}>¥{hpciTotal.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        {/* mdx Summary */}
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-600">mdx Total Usage (I & II)</span>
                            <span className={mdxOverTotalLimit ? 'text-red-600 font-bold' : 'text-slate-900 font-bold'}>
                                {((mdxTotal / MDX_TOTAL_LIMIT) * 100).toFixed(1)}%
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${mdxOverTotalLimit ? 'bg-red-500' : 'bg-purple-600'}`} 
                                style={{ width: `${Math.min((mdxTotal / MDX_TOTAL_LIMIT) * 100, 100)}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between items-center mt-1.5">
                            <p className="text-xs text-slate-400">Limit: ¥1,000,000</p>
                            <p className={`text-xs font-bold ${mdxOverTotalLimit ? 'text-red-600' : 'text-slate-600'}`}>¥{mdxTotal.toLocaleString()}</p>
                        </div>
                         <p className="text-[10px] text-slate-400 mt-2">
                            mdx resources (Tokyo & Osaka) share a combined budget of 1 Million JPY. Check 'Select' on mdx cards to apply.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        {/* Comparison Section */}
        <section>
          <ResourceComparison centers={centers} />
        </section>

        {/* Main Grid: Centers */}
        <section>
            <div className="flex items-center gap-3 mb-6">
                 <h2 className="text-xl font-bold text-slate-900">Resource Allocation</h2>
                 <div className="h-px flex-1 bg-slate-200"></div>
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                 >
                   <Settings size={14} /> Configure Limits
                 </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {centers.map(center => {
                    const req = requests.find(r => r.centerId === center.id)!;
                    const costData = costs.find(c => c.centerId === center.id)!;
                    
                    return (
                        <CenterCard
                            key={center.id}
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

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        centers={centers}
        onUpdateCenter={handleCenterUpdate}
      />
    </div>
  );
};

export default App;