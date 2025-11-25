import React, { useState, useEffect } from 'react';
import { PromptItem, PromptStatus, TaskConfig, VideoSample, RejectReason } from '../types';
import { checkAndRequestApiKey, generatePilotVideo } from '../services/geminiService';
import { Play, Check, X, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

interface PilotValidationProps {
  prompts: PromptItem[];
  config: TaskConfig;
  onUpdatePrompts: (prompts: PromptItem[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const PilotValidation: React.FC<PilotValidationProps> = ({ prompts, config, onUpdatePrompts, onNext, onBack }) => {
  const [localPrompts, setLocalPrompts] = useState<PromptItem[]>(prompts);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Sync local state if parent changes (rare in this flow but good practice)
    setLocalPrompts(prompts);
  }, [prompts]);

  const runPilotForPrompt = async (promptId: string) => {
    const prompt = localPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Check Key Selection (Crucial for Veo)
    try {
        await checkAndRequestApiKey();
    } catch (e) {
        alert("Failed to confirm API key selection.");
        return;
    }

    setGenerating(prev => ({ ...prev, [promptId]: true }));

    // Update status to running
    const updatedPromptsRunning = localPrompts.map(p => 
        p.id === promptId ? { ...p, status: PromptStatus.PILOT_RUNNING } : p
    );
    setLocalPrompts(updatedPromptsRunning);
    onUpdatePrompts(updatedPromptsRunning);

    const samples: VideoSample[] = [];

    // Parallel execution for the configured pilot count
    const generationPromises = Array.from({ length: config.pilotCount }).map(async (_, idx) => {
        try {
            const uri = await generatePilotVideo(prompt.text, config);
            if (uri) {
                samples.push({
                    id: crypto.randomUUID(),
                    uri,
                    status: 'completed',
                    generatedAt: Date.now()
                });
            } else {
                 throw new Error("No URI returned");
            }
        } catch (error) {
            console.error(`Sample ${idx} failed`, error);
            samples.push({
                id: crypto.randomUUID(),
                status: 'failed',
                errorMessage: 'Generation failed',
                generatedAt: Date.now()
            });
        }
    });

    await Promise.all(generationPromises);

    setGenerating(prev => ({ ...prev, [promptId]: false }));

    const updatedPromptsFinished = localPrompts.map(p => 
        p.id === promptId ? { 
            ...p, 
            status: PromptStatus.PILOT_COMPLETED,
            pilotSamples: samples
        } : p
    );
    setLocalPrompts(updatedPromptsFinished);
    onUpdatePrompts(updatedPromptsFinished);
  };

  const handleDecision = (promptId: string, status: PromptStatus, reason?: RejectReason, note?: string) => {
      const updated = localPrompts.map(p => {
          if (p.id === promptId) {
              return { 
                  ...p, 
                  status, 
                  rejectReason: reason,
                  rejectNote: note,
                  // Default batch config if approved
                  batchConfig: status === PromptStatus.APPROVED ? { count: 50, completed: 0 } : undefined
              };
          }
          return p;
      });
      setLocalPrompts(updated);
      onUpdatePrompts(updated);
  };

  const allDecided = localPrompts.every(p => 
    p.status === PromptStatus.APPROVED || p.status === PromptStatus.REJECTED
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Pilot Validation</h1>
            <p className="text-slate-400">Run small batches, review results, and select prompts for mass production.</p>
        </div>
        <div className="text-right">
             <div className="text-sm text-slate-500">Validation Progress</div>
             <div className="text-xl font-bold text-white">
                {localPrompts.filter(p => p.status === PromptStatus.APPROVED || p.status === PromptStatus.REJECTED).length} 
                <span className="text-slate-500 font-normal"> / {localPrompts.length} Prompts</span>
             </div>
        </div>
      </div>

      <div className="space-y-8">
        {localPrompts.map((prompt, idx) => (
            <div key={prompt.id} className={`bg-slate-900 border rounded-xl overflow-hidden transition-all ${
                prompt.status === PromptStatus.APPROVED ? 'border-green-500/50 shadow-green-900/10' :
                prompt.status === PromptStatus.REJECTED ? 'border-red-500/50 opacity-60' :
                'border-slate-800'
            }`}>
                {/* Header */}
                <div className="p-4 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div className="flex gap-4">
                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                        </div>
                        <p className="text-sm text-slate-300 font-mono max-w-3xl">{prompt.text}</p>
                    </div>
                    <div>
                        {prompt.status === PromptStatus.PENDING && (
                             <button 
                                onClick={() => runPilotForPrompt(prompt.id)}
                                disabled={generating[prompt.id]}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-all"
                             >
                                {generating[prompt.id] ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} />}
                                Run Pilot
                             </button>
                        )}
                        {prompt.status === PromptStatus.PILOT_RUNNING && (
                             <span className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <Loader2 className="animate-spin" size={14} /> Generating...
                             </span>
                        )}
                        {prompt.status === PromptStatus.PILOT_COMPLETED && (
                            <span className="text-yellow-500 text-xs font-bold uppercase tracking-wider">Needs Review</span>
                        )}
                        {prompt.status === PromptStatus.APPROVED && (
                            <span className="text-green-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"><Check size={14}/> Approved</span>
                        )}
                        {prompt.status === PromptStatus.REJECTED && (
                            <span className="text-red-500 flex items-center gap-1 text-xs font-bold uppercase tracking-wider"><X size={14}/> Rejected</span>
                        )}
                    </div>
                </div>

                {/* Video Grid Area */}
                <div className="p-4 min-h-[160px] bg-black/40">
                    {prompt.pilotSamples.length === 0 && !generating[prompt.id] && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 py-8">
                            <Play size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">Click "Run Pilot" to generate samples</p>
                        </div>
                    )}

                    {generating[prompt.id] && (
                         <div className="grid grid-cols-3 gap-4">
                            {[...Array(config.pilotCount)].map((_, i) => (
                                <div key={i} className="aspect-video bg-slate-800 rounded-lg animate-pulse flex items-center justify-center">
                                    <Loader2 className="animate-spin text-slate-600" />
                                </div>
                            ))}
                         </div>
                    )}

                    {prompt.pilotSamples.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {prompt.pilotSamples.map(sample => (
                                <div key={sample.id} className="relative group rounded-lg overflow-hidden bg-black aspect-video border border-slate-800">
                                    {sample.status === 'completed' && sample.uri ? (
                                        <video 
                                            src={sample.uri} 
                                            controls 
                                            className="w-full h-full object-cover"
                                            loop
                                            muted
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center flex-col text-red-400 gap-2">
                                            <AlertTriangle size={24} />
                                            <span className="text-xs">Generation Failed</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Decision Footer */}
                {prompt.pilotSamples.length > 0 && (prompt.status === PromptStatus.PILOT_COMPLETED || prompt.status === PromptStatus.APPROVED || prompt.status === PromptStatus.REJECTED) && (
                    <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                         {prompt.status === PromptStatus.REJECTED ? (
                             <div className="flex items-center gap-2 text-sm text-red-300 mr-auto px-2">
                                <span className="font-bold">Reason:</span> {prompt.rejectReason}
                                <button onClick={() => handleDecision(prompt.id, PromptStatus.PILOT_COMPLETED)} className="ml-2 text-slate-500 hover:text-white"><RefreshCw size={14}/></button>
                             </div>
                         ) : prompt.status === PromptStatus.APPROVED ? (
                            <div className="flex items-center gap-2 text-sm text-green-300 mr-auto px-2">
                                <span className="font-bold">Marked for Production</span>
                                <button onClick={() => handleDecision(prompt.id, PromptStatus.PILOT_COMPLETED)} className="ml-2 text-slate-500 hover:text-white"><RefreshCw size={14}/></button>
                            </div>
                         ) : (
                             <>
                                <div className="flex items-center gap-2">
                                    <select 
                                        className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 focus:outline-none"
                                        onChange={(e) => {
                                            if (e.target.value) {
                                                handleDecision(prompt.id, PromptStatus.REJECTED, e.target.value as RejectReason);
                                            }
                                        }}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Reject Reason...</option>
                                        {Object.values(RejectReason).map(r => (
                                            <option key={r} value={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={() => handleDecision(prompt.id, PromptStatus.APPROVED)}
                                    className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors flex items-center gap-2"
                                >
                                    <Check size={16} /> Keep & Scale
                                </button>
                            </>
                         )}
                    </div>
                )}
            </div>
        ))}
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-800">
        <button
            onClick={onBack}
            className="px-6 py-3 text-slate-400 hover:text-white font-medium transition-colors"
        >
            Back
        </button>
        <button
            onClick={onNext}
            disabled={!allDecided}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all shadow-lg shadow-indigo-600/20"
        >
            Proceed to Batch Production
            <Play size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default PilotValidation;