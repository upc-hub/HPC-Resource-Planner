import React, { useState, useMemo } from 'react';
import { CENTERS as INITIAL_CENTERS, HPCI_TOTAL_LIMIT } from './constants';
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
      cpuSelections: {},
      gpuSelections: {},
      storageSelections: {}
    }))
  );

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Calculate costs in real-time
  const costs = useMemo<CostBreakdown[]>(() => {
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
        cpuCost,
        gpuCost,
        storageCost,
        total,
        isOverLimit: center.type === 'HPCI' && total > 3000000
      };
    });
  }, [requests, centers]);

  // Aggregate HPCI Total
  const hpciTotal = useMemo(() => {
    return costs
      .filter(c => centers.find(center => center.id === c.centerId)?.type === 'HPCI')
      .reduce((sum, c) => sum + c.total, 0);
  }, [costs, centers]);

  const hpciOverTotalLimit = hpciTotal > HPCI_TOTAL_LIMIT;

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
                        <p className="text-xs text-slate-400 mt-2">
                            Total allowed across all 8 HPCI centers is 3.6 Million JPY.
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-600">mdx Total Usage</span>
                            <span className="text-slate-900 font-bold">
                                ¥{costs.filter(c => centers.find(cen => cen.id === c.centerId)?.type === 'mdx').reduce((a, b) => a + b.total, 0).toLocaleString()}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            mdx resources operate on a separate billing structure but are tracked here for completeness.
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
                    const cost = costs.find(c => c.centerId === center.id)!.total;
                    return (
                        <CenterCard
                            key={center.id}
                            center={center}
                            request={req}
                            cost={cost}
                            onUpdate={(type, optId, val) => handleRequestUpdate(center.id, type, optId, val)}
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