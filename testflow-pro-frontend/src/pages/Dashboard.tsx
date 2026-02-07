import React, { useState } from 'react';
import { 
  Play, RotateCcw, FileText, Bell, Zap, Clock, 
  CheckCircle2, XCircle, Loader2, Check, X, Minus, 
  Search, User, ChevronLeft, ChevronRight, Filter, Send 
} from 'lucide-react';
import { cn } from '../lib/utils';

// --- Types & Mock Data ---

interface TaskResult {
  id: number;
  name: string;
  buildId: string;
  status: 'success' | 'failure';
  duration: string;
  env: string;
  time: string;
  triggeredBy: string;
  stats: { total: number; passed: number; failed: number; skipped: number };
}

interface TemplateOption {
  id: string;
  name: string;
  defaultEnv: string;
  availableEnvs: string[];
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: '1', name: 'Backend API Regression', defaultEnv: 'sit', availableEnvs: ['dev', 'sit', 'uat'] },
  { id: '2', name: 'Frontend E2E Daily', defaultEnv: 'dev', availableEnvs: ['dev', 'sit'] },
  { id: '3', name: 'Payment Service Security', defaultEnv: 'uat', availableEnvs: ['sit', 'uat', 'prod'] },
];

const RUNNING_TASKS = [
  { id: 101, name: 'Smoke Test', buildId: '#452', status: 'running', progress: 65, env: 'dev', startTime: '10:00:00' },
  { id: 102, name: 'Mobile App E2E', buildId: '#89', status: 'queued', progress: 0, env: 'android', startTime: '10:05:00' },
];

// Generate more mock data for pagination
const COMPLETED_TASKS: TaskResult[] = Array.from({ length: 25 }).map((_, i) => ({
  id: 100 - i,
  name: i % 3 === 0 ? 'Backend API Regression' : i % 3 === 1 ? 'Frontend E2E Daily' : 'Payment Service Security',
  buildId: `#${120 - i}`,
  status: i % 5 === 0 ? 'failure' : 'success', // 20% fail rate
  duration: `${5 + (i % 10)}m`,
  env: ['dev', 'sit', 'uat', 'prod'][i % 4],
  time: '2026-02-07 09:30:00',
  triggeredBy: i % 2 === 0 ? 'admin' : 'qa-engineer',
  stats: { 
    total: 50 + i, 
    passed: i % 5 === 0 ? 48 + i : 50 + i, 
    failed: i % 5 === 0 ? 2 : 0, 
    skipped: i % 10 === 0 ? 2 : 0
  }
}));

export const Dashboard: React.FC = () => {
  // --- Quick Trigger State ---
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATE_OPTIONS[0].id);
  const [selectedEnv, setSelectedEnv] = useState<string>(TEMPLATE_OPTIONS[0].defaultEnv);

  // --- History State ---
  const [searchTask, setSearchTask] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Handle Template Change to update default Env
  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tplId = e.target.value;
    setSelectedTemplateId(tplId);
    const tpl = TEMPLATE_OPTIONS.find(t => t.id === tplId);
    if (tpl) setSelectedEnv(tpl.defaultEnv);
  };

  const currentTemplate = TEMPLATE_OPTIONS.find(t => t.id === selectedTemplateId);

  // Filter & Pagination Logic
  const filteredTasks = COMPLETED_TASKS.filter(task => 
    task.name.toLowerCase().includes(searchTask.toLowerCase()) &&
    task.triggeredBy.toLowerCase().includes(searchUser.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8">
      
      {/* Adjusted grid cols to 4 to give history list more space (3/4 vs 1/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Quick Trigger & Running Tasks */}
        <div className="space-y-6 lg:col-span-1">
          {/* 1. Simplified Quick Trigger */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
                <Zap className="text-amber-500 fill-amber-500/20" size={16} />
              </div>
              <h3 className="font-bold text-slate-800">快捷触发</h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  选择模板
                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                </label>
                <div className="relative">
                  <select 
                    value={selectedTemplateId}
                    onChange={handleTemplateChange}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer font-medium"
                  >
                    {TEMPLATE_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  运行环境
                  <span className="w-1 h-1 rounded-full bg-red-400"></span>
                </label>
                <div className="relative">
                  <select 
                    value={selectedEnv}
                    onChange={(e) => setSelectedEnv(e.target.value)}
                    className="w-full pl-3 pr-8 py-2.5 bg-slate-50 border border-transparent hover:bg-white hover:border-slate-300 focus:bg-white focus:border-blue-500 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer font-medium uppercase"
                  >
                    {currentTemplate?.availableEnvs.map(env => (
                      <option key={env} value={env}>{env}</option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="pt-2">
                <button className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                  <span className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                     <Play size={14} className="fill-current" />
                  </span>
                  立即执行
                </button>
              </div>
            </div>
          </section>

          {/* 2. Compact Running Tasks */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                 <Loader2 className="text-blue-600 animate-spin" size={18} />
                 <h3 className="font-bold text-slate-800">执行中</h3>
               </div>
               <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  {RUNNING_TASKS.length}
                </span>
             </div>
             
             <div className="divide-y divide-slate-100">
                {RUNNING_TASKS.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="max-w-[70%]">
                        <div className="font-bold text-slate-700 text-sm truncate">{task.name}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{task.buildId}</span>
                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 text-[10px] uppercase font-bold shadow-sm">{task.env}</span>
                        </div>
                      </div>
                      {task.status === 'running' ? (
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                          <span className="text-blue-600 text-[10px] uppercase font-bold">Run</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] uppercase font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Queued</span>
                      )}
                    </div>
                    <div className="relative h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3.5">
                      <div 
                        className={cn("absolute top-0 left-0 h-full rounded-full transition-all duration-500", task.status === 'running' ? "bg-gradient-to-r from-blue-500 to-indigo-500" : "bg-slate-300")}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </div>

        {/* Right Column: History List (Expanded to col-span-3) */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full min-h-[600px] overflow-hidden">
             
             {/* Header - Aligned with left cards */}
             <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div className="flex items-center gap-2">
                  <Clock className="text-slate-500" size={18} />
                  <h3 className="font-bold text-slate-800">最近完成</h3>
               </div>
               {/* Optional: Add a refresh or export button here if needed */}
             </div>

             {/* Filter Bar */}
             <div className="p-3 border-b border-slate-100 bg-white flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <input 
                      type="text" 
                      placeholder="筛选任务名称..." 
                      value={searchTask}
                      onChange={(e) => { setSearchTask(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent hover:bg-white hover:border-slate-300 focus:bg-white border transition-all rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                   />
                </div>
                <div className="relative w-full md:w-56">
                   <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                   <input 
                      type="text" 
                      placeholder="筛选触发人..." 
                      value={searchUser}
                      onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border-transparent hover:bg-white hover:border-slate-300 focus:bg-white border transition-all rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                   />
                </div>
             </div>

             {/* Table List */}
             <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10 text-xs uppercase tracking-wider">
                      <tr>
                         <th className="px-5 py-3 font-semibold">任务信息</th>
                         <th className="px-4 py-3 font-semibold">环境</th>
                         <th className="px-4 py-3 text-center font-semibold">通过率</th>
                         <th className="px-4 py-3 font-semibold">触发信息</th>
                         <th className="px-4 py-3 text-right font-semibold w-[140px]">操作</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {paginatedTasks.length > 0 ? (
                        paginatedTasks.map((task) => (
                           <tr key={task.id} className="hover:bg-blue-50/30 transition-colors group">
                              <td className="px-5 py-3">
                                 <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                      "w-2 h-2 rounded-full ring-2 ring-opacity-20", 
                                      task.status === 'success' ? "bg-green-500 ring-green-500" : "bg-red-500 ring-red-500"
                                    )} />
                                    <div className="font-bold text-slate-700">{task.name}</div>
                                 </div>
                                 <div className="text-[11px] text-slate-400 font-mono mt-1 ml-4.5 bg-slate-100 inline-block px-1.5 rounded-sm">{task.buildId}</div>
                              </td>
                              <td className="px-4 py-3">
                                 <span className="px-2 py-0.5 rounded-md border border-slate-200 bg-white text-slate-600 text-[11px] font-bold uppercase shadow-sm">
                                    {task.env}
                                 </span>
                              </td>
                              <td className="px-4 py-3">
                                 {/* Stats Grid */}
                                 <div className="flex items-center justify-center gap-3 text-xs">
                                     <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-slate-300 text-[9px] uppercase">Total</span>
                                        <span className="font-bold text-slate-600">{task.stats.total}</span>
                                     </div>
                                     <div className="w-px h-6 bg-slate-100 mx-1"></div>
                                     <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-green-500 text-[9px] uppercase">Pass</span>
                                        <span className="font-bold text-green-600">{task.stats.passed}</span>
                                     </div>
                                     <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-red-500 text-[9px] uppercase">Fail</span>
                                        <span className={cn("font-bold", task.stats.failed > 0 ? "text-red-600" : "text-slate-200")}>
                                           {task.stats.failed}
                                        </span>
                                     </div>
                                     <div className="flex flex-col items-center gap-0.5">
                                        <span className="text-slate-400 text-[9px] uppercase">Skip</span>
                                        <span className="font-bold text-slate-500">{task.stats.skipped}</span>
                                     </div>
                                 </div>
                              </td>
                              <td className="px-4 py-3">
                                 <div className="flex flex-col gap-1">
                                   <div className="text-slate-700 text-xs flex items-center gap-1.5 font-medium">
                                      <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User size={10} />
                                      </div>
                                      {task.triggeredBy}
                                   </div>
                                   <div className="text-slate-400 text-[11px] flex items-center gap-1.5 ml-0.5">
                                      <Clock size={10} className="text-slate-300" />
                                      {task.time.split(' ')[1]}
                                      <span className="text-slate-200">|</span> 
                                      {task.duration}
                                   </div>
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                 <div className="flex items-center justify-end gap-1.5">
                                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-md transition-all" title="查看报告">
                                       <FileText size={13} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-md transition-all" title="发送报告">
                                       <Send size={13} />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-md transition-all" title="重新执行">
                                       <RotateCcw size={13} />
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        ))
                      ) : (
                        <tr>
                           <td colSpan={5} className="text-center py-20 text-slate-400">
                              <div className="flex flex-col items-center">
                                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Search size={24} className="text-slate-300" />
                                 </div>
                                 <p className="text-sm font-medium">未找到匹配的任务</p>
                                 <p className="text-xs text-slate-400 mt-1">请尝试调整搜索条件</p>
                              </div>
                           </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>

             {/* Pagination */}
             <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="text-xs text-slate-500">
                   显示 {Math.min((currentPage - 1) * pageSize + 1, filteredTasks.length)} - {Math.min(currentPage * pageSize, filteredTasks.length)} 共 {filteredTasks.length} 条
                </div>
                <div className="flex items-center gap-2">
                   <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronLeft size={16} />
                   </button>
                   <span className="text-sm font-medium text-slate-700 px-2">
                      {currentPage} / {Math.max(1, totalPages)}
                   </span>
                   <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                      <ChevronRight size={16} />
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
