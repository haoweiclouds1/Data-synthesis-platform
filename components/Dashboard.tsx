import React from 'react';
import { PromptItem, PromptStatus, RejectReason } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, CheckCircle, XCircle, DollarSign, Activity } from 'lucide-react';

interface DashboardProps {
  prompts: PromptItem[];
}

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981'];

const Dashboard: React.FC<DashboardProps> = ({ prompts }) => {
  // Stats Calculation
  const totalPrompts = prompts.length;
  const approved = prompts.filter(p => p.status === PromptStatus.APPROVED).length;
  const rejected = prompts.filter(p => p.status === PromptStatus.REJECTED).length;
  
  const rejectionReasons = prompts
    .filter(p => p.status === PromptStatus.REJECTED)
    .reduce((acc, curr) => {
        const r = curr.rejectReason || 'Unknown';
        acc[r] = (acc[r] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(rejectionReasons).map(([name, value]) => ({ name, value }));

  const productionTotal = prompts.reduce((acc, curr) => acc + (curr.batchConfig?.completed || 0), 0);
  const estimatedCost = (productionTotal * 0.08).toFixed(2); // Mock cost per video

  const acceptanceRate = totalPrompts > 0 ? ((approved / totalPrompts) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2">Production Dashboard</h1>
            <p className="text-slate-400">Final statistics and dataset export.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-indigo-600/20">
            <Download size={20} /> Export Dataset Manifest
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle size={64} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Prompt Acceptance Rate</p>
            <p className="text-3xl font-bold text-white mt-2">{acceptanceRate}%</p>
            <p className="text-xs text-slate-500 mt-1">{approved} Approved / {totalPrompts} Generated</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={64} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Total Videos Produced</p>
            <p className="text-3xl font-bold text-white mt-2">{productionTotal}</p>
            <p className="text-xs text-green-500 mt-1">+100% Target Met</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <XCircle size={64} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Rejection Rate</p>
            <p className="text-3xl font-bold text-white mt-2">{totalPrompts > 0 ? ((rejected/totalPrompts)*100).toFixed(1) : 0}%</p>
            <p className="text-xs text-red-400 mt-1">{rejected} Prompts Discarded</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <DollarSign size={64} />
            </div>
            <p className="text-slate-400 text-sm font-medium">Est. Compute Cost</p>
            <p className="text-3xl font-bold text-white mt-2">${estimatedCost}</p>
            <p className="text-xs text-slate-500 mt-1">Based on Veo Preview Pricing</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
              <h3 className="text-lg font-bold text-white mb-6">Rejection Reasons Analysis</h3>
              {pieData.length > 0 ? (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-4 justify-center mt-4">
                        {pieData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                {entry.name} ({entry.value})
                            </div>
                        ))}
                    </div>
                </div>
              ) : (
                  <div className="h-64 flex items-center justify-center text-slate-500">
                      No rejections recorded.
                  </div>
              )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
             <h3 className="text-lg font-bold text-white mb-4">Prompt Performance</h3>
             <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {prompts.filter(p => p.status === PromptStatus.APPROVED).map(p => (
                    <div key={p.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-mono text-indigo-400">ID: {p.id.slice(0,8)}</span>
                             <span className="text-xs text-green-500 font-bold">{p.batchConfig?.count} Generated</span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-2">{p.text}</p>
                    </div>
                ))}
                {prompts.filter(p => p.status === PromptStatus.APPROVED).length === 0 && (
                     <div className="h-full flex items-center justify-center text-slate-500">
                        No approved prompts yet.
                    </div>
                )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;