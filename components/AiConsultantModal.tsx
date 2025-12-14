import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { CenterSpec, AiEstimateResponse } from '../types';
import { estimateResources } from '../services/geminiService';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  center: CenterSpec;
  onApply: (nodeHours: number, gpuHours: number) => void;
}

export const AiConsultantModal: React.FC<AiConsultantModalProps> = ({ isOpen, onClose, center, onApply }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<AiEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEstimate = async () => {
    if (!description.trim()) return;
    setLoading(true);
    setError(null);
    setEstimate(null);

    try {
      const result = await estimateResources(description, center);
      if (result) {
        setEstimate(result);
      } else {
        setError("Could not generate an estimate. Please try again with more details.");
      }
    } catch (err) {
      setError("An error occurred during estimation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 p-6 flex justify-between items-start text-white">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              AI Resource Consultant
            </h2>
            <p className="text-indigo-100 text-sm mt-1">
              Estimating for: <span className="font-semibold">{center.name}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {!estimate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Describe your research and computation needs
                </label>
                <textarea
                  className="w-full h-40 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="e.g., I need to train a Transformer model on a dataset of 1M images using PyTorch. The training typically takes 4 days on a single V100 GPU. I plan to run 5 experiments..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="text-xs text-slate-500 mt-2">
                  Hardware Context: {center.cpuModel} {center.gpuModel !== 'N/A' && `+ ${center.gpuModel}`}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={handleEstimate}
                disabled={loading || !description.trim()}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Generate Estimate'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
                <h3 className="font-semibold text-indigo-900 mb-4">Recommended Resources</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Node Hours</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{estimate.nodeHours.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">GPU Hours</span>
                    <div className="text-2xl font-bold text-slate-900 mt-1">{estimate.gpuHours.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2">AI Reasoning</h4>
                <div className="p-4 bg-slate-50 rounded-lg text-slate-700 text-sm leading-relaxed border border-slate-200">
                  {estimate.reasoning}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEstimate(null)}
                  className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    onApply(estimate.nodeHours, estimate.gpuHours);
                    onClose();
                  }}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Apply to Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
