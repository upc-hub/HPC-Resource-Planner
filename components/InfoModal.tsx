import React, { useState } from 'react';
import { X, Server, Cloud, Info, Cpu, Zap, BarChart3, ArrowRight } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'gpus'>('guide');

  if (!isOpen) return null;

  const gpuData = [
    {
      model: "NVIDIA A100",
      memory: "40GB / 80GB HBM2e",
      desc: "Standard for AI/HPC. Good baseline performance.",
      centers: "Osaka (SQUID), Tokyo (Wisteria), mdx-I",
      tier: "1"
    },
    {
      model: "NVIDIA H100",
      memory: "80GB HBM3",
      desc: "~3x-6x faster than A100 for AI workloads.",
      centers: "Science Tokyo, Kyushu, Hokkaido",
      tier: "2"
    },
    {
      model: "NVIDIA H200",
      memory: "141GB HBM3e",
      desc: "Higher memory bandwidth & capacity than H100.",
      centers: "mdx-II (Osaka)",
      tier: "3"
    },
    {
      model: "NVIDIA GH200",
      memory: "96GB HBM3 + Unified",
      desc: "Grace CPU + Hopper GPU. Huge unified memory space.",
      centers: "Tokyo (Miyabi-G)",
      tier: "4"
    },
    {
      model: "NVIDIA GB200",
      memory: "384GB+ HBM3e",
      desc: "Blackwell Architecture. Next-gen extreme performance.",
      centers: "Nagoya",
      tier: "5"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Info className="w-5 h-5" />
              Infrastructure Guide
            </h2>
            <p className="text-slate-400 text-xs mt-1">HPCI/mdx Types & Hardware Specs</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X /></button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-6 pt-4 flex gap-6">
            <button 
                onClick={() => setActiveTab('guide')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'guide' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Cloud size={16} /> Platform Guide
            </button>
            <button 
                onClick={() => setActiveTab('gpus')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'gpus' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                <Cpu size={16} /> GPU Comparison
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          
          {/* Guide Content */}
          {activeTab === 'guide' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* HPCI Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <Server size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">HPCI</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">High Performance Computing Infrastructure</p>
                    
                    <div className="prose prose-sm text-slate-600 space-y-4 flex-1">
                        <p className="font-medium text-slate-800">
                        A network of top-tier supercomputers across Japanese universities and research institutes (like RIKEN).
                        </p>
                        
                        <ul className="space-y-3 list-none pl-0">
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-blue-600 uppercase">Usage Model</span>
                                <span><strong>Batch Processing.</strong> Users submit jobs to a scheduler (like Slurm). Resources are allocated for the duration of the job and released afterwards.</span>
                            </li>
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-blue-600 uppercase">Cost & Limits</span>
                                <span><strong>Pay-per-use</strong> (Node-hours). Costs are deducted from a strict project budget (e.g., 3 Million JPY).</span>
                            </li>
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-blue-600 uppercase">Best For</span>
                                <span>Large-scale scientific simulations (weather, physics), molecular dynamics, and heavy distributed training tasks that require raw power.</span>
                            </li>
                        </ul>
                    </div>
                    </div>

                    {/* mdx Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-purple-500 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                        <Cloud size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">mdx</h3>
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Platform for Data-Driven Science</p>
                    
                    <div className="prose prose-sm text-slate-600 space-y-4 flex-1">
                        <p className="font-medium text-slate-800">
                        A high-performance virtualized platform designed for data science, flexibility, and societal implementation.
                        </p>
                        
                        <ul className="space-y-3 list-none pl-0">
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-purple-600 uppercase">Usage Model</span>
                                <span><strong>Virtual Machines (VMs).</strong> Users act as administrators of their own VMs, allowing for custom OS configurations, persistent web services, and DBs.</span>
                            </li>
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-purple-600 uppercase">Cost & Limits</span>
                                <span><strong>Fixed Resource Packs.</strong> Budget is often a flat fee allocation (e.g., 1 Million JPY shared budget) for a reserved period.</span>
                            </li>
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-purple-600 uppercase">Best For</span>
                                <span>Hosting web applications, continuous data collection/integration, flexible AI prototyping, and environments requiring root access.</span>
                            </li>
                        </ul>
                    </div>
                    </div>
                </div>

                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex gap-4 items-start">
                    <div className="shrink-0 text-indigo-600 mt-0.5"><Info size={24} /></div>
                    <div>
                        <h4 className="font-bold text-indigo-900 text-sm mb-1">Which one should I choose?</h4>
                        <p className="text-sm text-indigo-800 leading-relaxed">
                        Choose <strong>HPCI</strong> if you need raw computational speed for heavy calculations that run for a finite time. 
                        Choose <strong>mdx</strong> if you need a persistent server environment, need to install custom system-level software, or are building a web-based data platform.
                        </p>
                    </div>
                </div>
            </div>
          )}

          {/* GPU Comparison Content */}
          {activeTab === 'gpus' && (
             <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                         <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 size={18} className="text-indigo-600"/> Accelerator Comparison</h3>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                            Less Powerful <ArrowRight size={12}/> More Powerful
                         </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Model</th>
                                    <th className="px-6 py-4">Memory</th>
                                    <th className="px-6 py-4">Performance Note</th>
                                    <th className="px-6 py-4">Available At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {gpuData.map((gpu, idx) => (
                                    <tr key={gpu.model} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm
                                                    ${idx === 0 ? 'bg-slate-100 text-slate-500' : ''}
                                                    ${idx === 1 ? 'bg-blue-100 text-blue-600' : ''}
                                                    ${idx === 2 ? 'bg-indigo-100 text-indigo-600' : ''}
                                                    ${idx === 3 ? 'bg-purple-100 text-purple-600' : ''}
                                                    ${idx === 4 ? 'bg-fuchsia-100 text-fuchsia-600' : ''}
                                                `}>
                                                    {idx + 1}
                                                </div>
                                                <span className="font-bold text-slate-900">{gpu.model}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">{gpu.memory}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {gpu.desc}
                                            {idx >= 3 && <Zap size={12} className="inline ml-1 text-amber-500 fill-amber-500"/>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block py-1 px-2 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                                                {gpu.centers}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 italic text-center">
                        * Performance ranking is approximate based on theoretical FP64/AI compute throughput.
                    </div>
                </div>
             </div>
          )}

        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};