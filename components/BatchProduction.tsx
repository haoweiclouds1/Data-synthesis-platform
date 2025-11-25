import React, { useState, useEffect } from 'react';
import { PromptItem, PromptStatus } from '../types';
import { Layers, Play, Pause, CheckCircle2, RotateCcw } from 'lucide-react';

interface BatchProductionProps {
  prompts: PromptItem[];
  onFinish: () => void;
  onBack: () => void;
}

const BatchProduction: React.FC<BatchProductionProps> = ({ prompts, onFinish, onBack }) => {
  // Only Approved prompts enter this stage
  const [productionItems, setProductionItems] = useState<PromptItem[]>(
    prompts.filter(p => p.status === PromptStatus.APPROVED)
  );
  
  const [isRunning, setIsRunning] = useState(false);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [totalTarget, setTotalTarget] = useState(0);

  // Initialize total target
  useEffect(() => {
    const total = productionItems.reduce((acc, curr) => acc + (curr.batchConfig?.count || 0), 0);
    setTotalTarget(total);
  }, [productionItems]);

  const updateBatchCount = (id: string, count: number) => {
    setProductionItems(prev => prev.map(p => 
        p.id === id ? { ...p, batchConfig: { ...p.batchConfig!, count } } : p
    ));
  };

  // Simulation of batch processing
  useEffect(() => {
    let interval: any;
    if (isRunning) {
        interval = setInterval(() => {
            setProductionItems(prev => {
                let anyUpdated = false;
                const next = prev.map(p => {
                    if (p.batchConfig && p.batchConfig.completed < p.batchConfig.count) {
                        // Simulate random completion
                        if (Math.random() > 0.7) {
                             anyUpdated = true;
                             return { 
                                 ...p, 
                                 batchConfig: { 
                                     ...p.batchConfig, 
                                     completed: p.batchConfig.completed + 1 
                                 } 
                             };
                        }
                    }
                    return p;
                });
                
                if (!anyUpdated) {
                    // Check if all done
                    const allDone = next.every(p => p.batchConfig!.completed >= p.batchConfig!.count);
                    if (allDone) setIsRunning(false);
                }
                return next;
            });
        }, 500);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Derived stats
  const currentTotalCompleted = productionItems.reduce((acc, curr) => acc + (curr.batchConfig?.completed || 0), 0);
  const overallProgress = totalTarget > 0 ? (currentTotalCompleted / totalTarget) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Batch Production</h1>
            <p className="text-slate-400">Scale up production for validated prompts. Monitor real-time progress.</p>
        </div>
        <div className="flex gap-4">
             {!isRunning && overallProgress < 100 && (
                <button 
                    onClick={() => setIsRunning(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg shadow-green-600/20"
                >
                    <Play size={20} fill="currentColor" /> Start Production
                </button>
             )}
             {isRunning && (
                 <button 
                    onClick={() => setIsRunning(false)}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                    <Pause size={20} fill="currentColor" /> Pause
                </button>
             )}
        </div>
      </div>

      {/* Main Progress */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-full flex justify-between text-sm text-slate-400 font-medium mb-1">
                <span>Overall Progress</span>
                <span>{currentTotalCompleted} / {totalTarget} Videos</span>
            </div>
            <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out relative"
                    style={{ width: `${overallProgress}%` }}
                >
                    <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse"></div>
                </div>
            </div>
      </div>

      <div className="space-y-4">
          <h3 className="text-xl font-semibold text-white">Queue Details</h3>
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
             <table className="w-full text-left">
                 <thead className="bg-slate-950 text-slate-400 text-sm uppercase font-bold">
                     <tr>
                         <th className="p-4">Prompt Segment</th>
                         <th className="p-4 w-32">Target Qty</th>
                         <th className="p-4 w-64">Progress</th>
                         <th className="p-4 w-32">Status</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 text-slate-300">
                     {productionItems.map(item => {
                         const p = (item.batchConfig!.completed / item.batchConfig!.count) * 100;
                         return (
                            <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="p-4 font-mono text-sm truncate max-w-lg" title={item.text}>{item.text}</td>
                                <td className="p-4">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="1000"
                                        disabled={isRunning}
                                        value={item.batchConfig?.count} 
                                        onChange={(e) => updateBatchCount(item.id, parseInt(e.target.value))}
                                        className="bg-slate-950 border border-slate-700 rounded w-20 px-2 py-1 focus:outline-none text-center"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div style={{ width: `${p}%`}} className="h-full bg-indigo-500 rounded-full transition-all duration-300"></div>
                                        </div>
                                        <span className="text-xs w-12 text-right">{Math.round(p)}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    {p >= 100 ? (
                                        <span className="text-green-500 flex items-center gap-1 text-xs font-bold uppercase"><CheckCircle2 size={14} /> Done</span>
                                    ) : isRunning ? (
                                        <span className="text-indigo-400 flex items-center gap-1 text-xs font-bold uppercase"><RotateCcw size={14} className="animate-spin" /> Active</span>
                                    ) : (
                                        <span className="text-slate-500 text-xs font-bold uppercase">Queued</span>
                                    )}
                                </td>
                            </tr>
                         );
                     })}
                 </tbody>
             </table>
          </div>
      </div>

       <div className="flex justify-between pt-8 border-t border-slate-800">
        <button
            onClick={onBack}
            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
        >
            Back
        </button>
        <button
            onClick={onFinish}
            disabled={overallProgress < 100}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-600/20"
        >
            Finish & View Dashboard
            <Layers size={18} />
        </button>
      </div>
    </div>
  );
};

export default BatchProduction;