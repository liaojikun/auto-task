import React, { useState } from 'react';
import { Plus, Search, FileJson, Bell, Trash2, Edit2, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface Template {
  id: string;
  name: string;
  jenkinsJob: string;
  defaultEnv: string;
  params: string;
  autoNotify: boolean;
  lastUsed: string;
}

const MOCK_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Backend API Regression',
    jenkinsJob: 'api-regression-test-suite',
    defaultEnv: 'staging',
    params: `{\n  "tags": "@smoke",\n  "workers": 4\n}`,
    autoNotify: true,
    lastUsed: '2 hours ago'
  },
  {
    id: '2',
    name: 'Frontend E2E Daily',
    jenkinsJob: 'frontend-e2e-daily',
    defaultEnv: 'dev',
    params: `{\n  "browser": "chrome",\n  "headless": true\n}`,
    autoNotify: false,
    lastUsed: '1 day ago'
  }
];

export const TaskTemplates: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">执行模板</h2>
          <p className="text-slate-500 mt-1">管理 Jenkins 任务的快捷执行预设</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium"
        >
          <Plus size={18} />
          新建模板
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className={cn("space-y-4 transition-all duration-300", isCreating ? "lg:col-span-2" : "lg:col-span-3")}>
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="搜索模板..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                   <tr>
                      <th className="px-6 py-4">模板名称</th>
                      <th className="px-6 py-4">关联 Jenkins Job</th>
                      <th className="px-6 py-4">默认环境</th>
                      <th className="px-6 py-4">自动通知</th>
                      <th className="px-6 py-4 text-right">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_TEMPLATES.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                             <FileJson size={16} />
                          </div>
                          {template.name}
                       </td>
                       <td className="px-6 py-4 text-slate-600 font-mono text-xs">{template.jenkinsJob}</td>
                       <td className="px-6 py-4">
                          <span className={cn(
                             "px-2 py-1 rounded text-xs font-medium uppercase",
                             template.defaultEnv === 'production' ? "bg-red-100 text-red-700" :
                             template.defaultEnv === 'staging' ? "bg-orange-100 text-orange-700" :
                             "bg-green-100 text-green-700"
                          )}>
                             {template.defaultEnv}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-slate-600">
                          {template.autoNotify ? (
                            <div className="flex items-center gap-1.5 text-green-600">
                              <Bell size={14} className="fill-current" />
                              <span className="text-xs">开启</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">关闭</span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="立即执行">
                                <Play size={16} />
                             </button>
                             <button className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors">
                                <Edit2 size={16} />
                             </button>
                             <button className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </div>

        {/* Creation Form Panel (Slide over or persistent) */}
        {isCreating && (
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">新建模板</h3>
                <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                   &times;
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">模板名称</label>
                   <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" placeholder="e.g., Nightly Build" />
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Jenkins Job Name</label>
                   <input type="text" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono" placeholder="job-name-in-jenkins" />
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">默认环境</label>
                   <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm">
                      <option value="dev">Development</option>
                      <option value="staging">Staging</option>
                      <option value="production">Production</option>
                   </select>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">构建参数 (JSON)</label>
                      <span className="text-xs text-slate-400 font-mono">Invalid JSON</span>
                   </div>
                   <textarea 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono h-32"
                      defaultValue={`{
  "key": "value"
}`}
                   />
                </div>

                <div className="flex items-center gap-3 pt-2">
                   <input type="checkbox" id="autoNotify" className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" defaultChecked />
                   <label htmlFor="autoNotify" className="text-sm text-slate-700 select-none">任务完成后自动发送通知</label>
                </div>

                <div className="pt-4 flex gap-3">
                   <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                      创建
                   </button>
                   <button onClick={() => setIsCreating(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors">
                      取消
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
