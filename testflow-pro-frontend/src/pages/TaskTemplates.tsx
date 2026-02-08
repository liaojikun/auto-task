import React, { useState, useEffect } from 'react';
import { Plus, Search, FileJson, Bell, Trash2, Edit2, Play } from 'lucide-react';
import { cn } from '../lib/utils';
import { templateApi } from '../api/templates';
import { dashboardApi } from '../api/dashboard'; // Import dashboardApi
import { systemConfigApi } from '../api/systemConfig'; // Import system config API
import type { CreateTemplateParams } from '../api/templates';
import type { TestTemplate } from '../api/types';

export const TaskTemplates: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [templates, setTemplates] = useState<TestTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for dropdown options
  const [envOptions, setEnvOptions] = useState<string[]>([]);
  const [jobOptions, setJobOptions] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<CreateTemplateParams>({
    name: '',
    jenkins_job_name: '',
    default_env: '',
    params: '{}',
    auto_notify: true,
    available_envs: ['dev', 'sit', 'uat', 'prod'], // This could also be dynamic if needed, but sticking to requirement for now
    notification_ids: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      jenkins_job_name: '',
      default_env: '',
      params: '{}',
      auto_notify: true,
      available_envs: ['dev', 'sit', 'uat', 'prod'],
      notification_ids: []
    });
    setEditingId(null);
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await templateApi.getAll();
      setTemplates(data);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemConfigs = async () => {
    try {
      const response = await systemConfigApi.getAll();
      // response.data is [{"ENV": [...]}, {"JOB_NAME": [...]}]
      
      const envData = response.data.find(item => item["ENV"]);
      if (envData) {
        setEnvOptions(envData["ENV"]);
      }

      const jobData = response.data.find(item => item["JOB_NAME"]);
      if (jobData) {
        setJobOptions(jobData["JOB_NAME"]);
      }

    } catch (error) {
      console.error("Failed to fetch system configs", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
    fetchSystemConfigs();
  }, []);

  const handleSave = async () => {
    try {
      // Basic validation could go here
      if (editingId) {
        await templateApi.update(editingId, formData);
      } else {
        await templateApi.create(formData);
      }
      setIsCreating(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error("Failed to save template", error);
      alert(editingId ? "更新失败，请检查输入" : "创建失败，请检查输入");
    }
  };

  const handleTrigger = async (template: TestTemplate) => {
    if (!confirm(`确定要立即执行模板 "${template.name}" 吗？\n环境: ${template.default_env}`)) return;
    try {
      await dashboardApi.trigger(template.id, template.default_env, template.auto_notify);
      alert('任务已成功触发');
    } catch (error) {
      console.error("Failed to trigger task", error);
      alert('触发失败');
    }
  };

  const handleEdit = (template: TestTemplate) => {
    setEditingId(template.id);
    setFormData({
      name: template.name,
      jenkins_job_name: template.jenkins_job_name,
      default_env: template.default_env,
      params: template.params || '{}',
      auto_notify: template.auto_notify,
      available_envs: template.available_envs || ['dev', 'sit', 'uat','prod'],
      notification_ids: [] 
    });
    setIsCreating(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("确定要删除这个模板吗？")) return;
    try {
      await templateApi.delete(id);
      fetchTemplates();
    } catch (error) {
      console.error("Failed to delete template", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">执行模板</h2>
          <p className="text-slate-500 mt-1">管理 Jenkins 任务的快捷执行预设</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsCreating(true);
          }}
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
             {loading ? (
                <div className="p-8 text-center text-slate-500">加载中...</div>
             ) : (
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
                  {templates.map((template) => (
                    <tr key={template.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                             <FileJson size={16} />
                          </div>
                          {template.name}
                       </td>
                       <td className="px-6 py-4 text-slate-600 font-mono text-xs">{template.jenkins_job_name}</td>
                       <td className="px-6 py-4">
                          <span className={cn(
                             "px-2 py-1 rounded text-xs font-medium uppercase",
                             template.default_env === 'production' ? "bg-red-100 text-red-700" :
                             template.default_env === 'sit' ? "bg-orange-100 text-orange-700" :
                             "bg-green-100 text-green-700"
                          )}>
                             {template.default_env}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-slate-600">
                          {template.auto_notify ? (
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
                             <button 
                                onClick={() => handleTrigger(template)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" 
                                title="立即执行"
                             >
                                <Play size={16} />
                             </button>
                             <button 
                                onClick={() => handleEdit(template)}
                                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
                             >
                                <Edit2 size={16} />
                             </button>
                             <button 
                                onClick={() => handleDelete(template.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
                  {templates.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">暂无模板数据</td>
                    </tr>
                  )}
                </tbody>
             </table>
             )}
          </div>
        </div>

        {/* Creation Form Panel */}
        {isCreating && (
          <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-fit animate-in slide-in-from-right-4 fade-in duration-300">
             <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">{editingId ? '编辑模板' : '新建模板'}</h3>
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                   &times;
                </button>
             </div>
             <div className="p-6 space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">模板名称</label>
                   <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" 
                    placeholder="e.g., Nightly Build" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Jenkins Job Name</label>
                   <select
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono" 
                    value={formData.jenkins_job_name}
                    onChange={e => setFormData({...formData, jenkins_job_name: e.target.value})}
                   >
                     <option value="" disabled>选择关联的 Job</option>
                     {jobOptions.map(job => (
                       <option key={job} value={job}>{job}</option>
                     ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">默认环境</label>
                   <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    value={formData.default_env}
                    onChange={e => setFormData({...formData, default_env: e.target.value})}
                   >
                      <option value="" disabled>选择环境</option>
                      {envOptions.map(env => (
                        <option key={env} value={env}>{env}</option>
                      ))}
                   </select>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">构建参数 (JSON)</label>
                   </div>
                   <textarea 
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono h-32"
                      value={formData.params}
                      onChange={e => setFormData({...formData, params: e.target.value})}
                   />
                </div>

                <div className="flex items-center gap-3 pt-2">
                   <input 
                    type="checkbox" 
                    id="autoNotify" 
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    checked={formData.auto_notify}
                    onChange={e => setFormData({...formData, auto_notify: e.target.checked})}
                   />
                   <label htmlFor="autoNotify" className="text-sm text-slate-700 select-none">任务完成后自动发送通知</label>
                </div>

                <div className="pt-4 flex gap-3">
                   <button 
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                   >
                      {editingId ? '保存' : '创建'}
                   </button>
                   <button 
                    onClick={() => {
                      setIsCreating(false);
                      resetForm();
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium transition-colors"
                   >
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