import React, { useState } from 'react';
import { TaskConfig, TaskType } from '../types';
import { Video, Mic, ArrowRight, Wand2 } from 'lucide-react';

interface CreateTaskProps {
  onNext: (config: TaskConfig, request: string) => void;
}

const CreateTask: React.FC<CreateTaskProps> = ({ onNext }) => {
  const [taskName, setTaskName] = useState('New Dataset Batch 001');
  const [taskType, setTaskType] = useState<TaskType>(TaskType.T2V);
  const [request, setRequest] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [pilotCount, setPilotCount] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    const config: TaskConfig = {
      id: crypto.randomUUID(),
      name: taskName,
      type: taskType,
      baseModel: 'veo-3.1-fast-generate-preview',
      resolution,
      aspectRatio,
      pilotCount
    };
    onNext(config, request);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Generation Task</h1>
        <p className="text-slate-400">Define your dataset parameters and let the PEA (Prompt Engineer Agent) draft the initial prompts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTaskType(TaskType.T2V)}
            className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
              taskType === TaskType.T2V
                ? 'border-indigo-500 bg-indigo-500/10 text-white'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Video size={32} />
            <span className="font-semibold">Text-to-Video</span>
          </button>
          
          <button
            type="button"
            onClick={() => setTaskType(TaskType.A2V)}
            className={`p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
              taskType === TaskType.A2V
                ? 'border-indigo-500 bg-indigo-500/10 text-white'
                : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Mic size={32} />
            <span className="font-semibold">Audio-to-Video</span>
          </button>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Task Name</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-300">Base Model</label>
             <select disabled className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-slate-500 cursor-not-allowed">
               <option>Veo 3.1 Fast (Preview)</option>
             </select>
          </div>
        </div>

        {/* Configuration */}
        <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Resolution</label>
                <select 
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Aspect Ratio</label>
                <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                </select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Pilot Samples / Prompt</label>
                <select 
                    value={pilotCount}
                    onChange={(e) => setPilotCount(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value={1}>1 (Fast)</option>
                    <option value={2}>2</option>
                    <option value={3}>3 (Recommended)</option>
                </select>
            </div>
        </div>

        {/* Natural Language Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
             <label className="text-sm font-medium text-slate-300">Concept Description</label>
             <span className="text-xs text-indigo-400 flex items-center gap-1">
                <Wand2 size={12} /> AI Assisted
             </span>
          </div>
          <textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="Describe the videos you want to generate. E.g., 'Cinematic drone shots of a futuristic city in heavy rain, cyberpunk style, neon lights reflecting on wet pavement...'"
            className="w-full h-32 bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={!request.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all"
          >
            Generate Prompts
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;