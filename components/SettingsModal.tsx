import React from 'react';
import { X, Settings } from 'lucide-react';
import { CenterSpec, ResourceOption } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  centers: CenterSpec[];
  onUpdateCenter: (id: string, type: 'cpu' | 'gpu' | 'storage', optionId: string, value: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, centers, onUpdateCenter }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-900 p-6 flex justify-between items-center text-white rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </h2>
            <p className="text-slate-400 text-xs mt-1">Define resource upper limits for each institution queue</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"><X /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {centers.map(center => (
              <div key={center.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                    <div>
                        <h3 className="font-bold text-slate-800">{center.name}</h3>
                        <p className="text-xs text-slate-500">{center.description}</p>
                    </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase h-fit ${center.type === 'HPCI' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {center.type}
                    </span>
                </div>

                <div className="space-y-4">
                    {/* CPU */}
                    {center.cpuOptions.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">CPU Limits</h4>
                            <div className="space-y-2">
                                {center.cpuOptions.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-slate-600 truncate" title={opt.name}>{opt.name}</span>
                                        <input 
                                            type="number"
                                            value={opt.limit}
                                            onChange={(e) => onUpdateCenter(center.id, 'cpu', opt.id, Number(e.target.value))}
                                            className="w-full border border-slate-300 rounded px-2 py-1 text-slate-900"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                     {/* GPU */}
                    {center.gpuOptions.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GPU Limits</h4>
                            <div className="space-y-2">
                                {center.gpuOptions.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-slate-600 truncate" title={opt.name}>{opt.name}</span>
                                        <input 
                                            type="number"
                                            value={opt.limit}
                                            onChange={(e) => onUpdateCenter(center.id, 'gpu', opt.id, Number(e.target.value))}
                                            className="w-full border border-slate-300 rounded px-2 py-1 text-slate-900"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Storage */}
                    {center.storageOptions.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Storage Limits</h4>
                            <div className="space-y-2">
                                {center.storageOptions.map(opt => (
                                    <div key={opt.id} className="flex items-center gap-2 text-sm">
                                        <span className="w-24 text-slate-600 truncate" title={opt.name}>{opt.name}</span>
                                        <input 
                                            type="number"
                                            value={opt.limit}
                                            onChange={(e) => onUpdateCenter(center.id, 'storage', opt.id, Number(e.target.value))}
                                            className="w-full border border-slate-300 rounded px-2 py-1 text-slate-900"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-white rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors">
            Close Configuration
          </button>
        </div>
      </div>
    </div>
  );
};