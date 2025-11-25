import React from 'react';
import { LayoutDashboard, Film, Layers, Zap, Settings, PlayCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeStep: number;
}

const Layout: React.FC<LayoutProps> = ({ children, activeStep }) => {
  const steps = [
    { id: 1, name: 'Task Setup', icon: <Settings size={18} /> },
    { id: 2, name: 'Prompt Eng.', icon: <Zap size={18} /> },
    { id: 3, name: 'Pilot Run', icon: <PlayCircle size={18} /> },
    { id: 4, name: 'Batch Prod.', icon: <Layers size={18} /> },
    { id: 5, name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Film className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">DataFlow AI</span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {steps.map((step) => {
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;
            
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : isCompleted
                    ? 'text-indigo-400 bg-indigo-950/30'
                    : 'text-slate-500'
                }`}
              >
                {step.icon}
                <span className={`font-medium ${isActive ? 'text-white' : ''}`}>
                  {step.name}
                </span>
                {isCompleted && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400"></span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400">
            <p className="font-semibold text-slate-300 mb-1">Session Info</p>
            <p>Model: Veo 3.1 Preview</p>
            <p>Env: Production</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
         <div className="absolute top-0 left-0 w-full h-1 bg-slate-900">
            <div 
                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                style={{ width: `${(activeStep / 5) * 100}%` }}
            />
         </div>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;