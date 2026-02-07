import React from 'react';
import { CalendarClock, MoreVertical, Plus, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// Mock Data
const SCHEDULES = [
  { 
    id: 1, 
    templateName: 'Backend API Regression', 
    cron: '0 2 * * *', 
    description: 'Every day at 2:00 AM', 
    nextRun: '2026-02-08 02:00:00', 
    enabled: true,
    lastRunStatus: 'success'
  },
  { 
    id: 2, 
    templateName: 'Frontend E2E Daily', 
    cron: '0 12 * * 1-5', 
    description: 'At 12:00 PM, Monday through Friday', 
    nextRun: '2026-02-09 12:00:00', 
    enabled: false,
    lastRunStatus: 'failure'
  },
  { 
    id: 3, 
    templateName: 'Weekly Security Scan', 
    cron: '0 0 * * 0', 
    description: 'At 00:00 on Sunday', 
    nextRun: '2026-02-08 00:00:00', 
    enabled: true,
    lastRunStatus: 'success'
  },
];

export const ScheduleConfig: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">定时调度</h2>
          <p className="text-slate-500 mt-1">管理自动化任务的触发规则</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium">
          <Plus size={18} />
          新建计划
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">任务名称</th>
              <th className="px-6 py-4">触发规则 (Cron)</th>
              <th className="px-6 py-4">下次执行预览</th>
              <th className="px-6 py-4">状态</th>
              <th className="px-6 py-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SCHEDULES.map((schedule) => (
              <tr key={schedule.id} className={cn("transition-colors", schedule.enabled ? "hover:bg-slate-50" : "bg-slate-50/50")}>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{schedule.templateName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{schedule.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                    {schedule.cron}
                  </span>
                </td>
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={14} />
                      <span>{schedule.nextRun}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20",
                      schedule.enabled ? "bg-blue-600" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm",
                        schedule.enabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                   <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                      <MoreVertical size={16} />
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {SCHEDULES.length === 0 && (
           <div className="p-12 text-center text-slate-500">
              <CalendarClock size={48} className="mx-auto text-slate-300 mb-4" />
              <p>暂无定时任务，请点击右上角新建</p>
           </div>
        )}
      </div>
    </div>
  );
};
