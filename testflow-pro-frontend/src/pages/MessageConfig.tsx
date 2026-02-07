import React, { useState } from 'react';
import { Save, Send, Smartphone, Mail, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

export const MessageConfig: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'webhook' | 'email'>('webhook');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">消息通知配置</h2>
          <p className="text-slate-500 mt-1">管理流水线执行结果的推送渠道与模板</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium">
          <Save size={18} />
          保存配置
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('webhook')}
                className={cn(
                  "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === 'webhook' 
                    ? "bg-white text-blue-600 border-b-2 border-blue-600" 
                    : "bg-slate-50 text-slate-600 hover:bg-white"
                )}
              >
                <Smartphone size={18} />
                IM 机器人 Webhook
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={cn(
                  "flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                  activeTab === 'email' 
                    ? "bg-white text-blue-600 border-b-2 border-blue-600" 
                    : "bg-slate-50 text-slate-600 hover:bg-white"
                )}
              >
                <Mail size={18} />
                SMTP 邮件服务
              </button>
            </div>

            <div className="p-6 space-y-4">
              {activeTab === 'webhook' ? (
                <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">平台类型</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm">
                          <option>飞书 (Feishu)</option>
                          <option>钉钉 (DingTalk)</option>
                          <option>企业微信 (WeCom)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">机器人名称</label>
                         <input type="text" placeholder="DevOps Assistant" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Webhook URL</label>
                      <input type="text" placeholder="https://open.feishu.cn/open-apis/bot/v2/hook/..." className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">签名密钥 (Secret)</label>
                      <input type="password" placeholder="Optional security token" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono" />
                   </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">SMTP 服务器</label>
                        <input type="text" placeholder="smtp.exmail.qq.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">端口</label>
                         <input type="number" placeholder="465" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">发送账号</label>
                        <input type="text" placeholder="notification@company.com" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-slate-700">密码 / 授权码</label>
                         <input type="password" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">发件人显示名称</label>
                      <input type="text" placeholder="TestFlow Pro" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm" />
                   </div>
                </div>
              )}
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
               <button className="text-slate-600 hover:text-blue-600 text-sm font-medium flex items-center gap-2">
                 <Send size={16} />
                 发送测试消息
               </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-1">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2 text-slate-700 font-medium">
                 <Eye size={18} />
                 样式预览
              </div>
              <div className="p-6 flex-1 bg-slate-50 flex items-center justify-center">
                  {/* Mock Preview Card - Feishu Style */}
                  <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden max-w-sm">
                      <div className={`h-2 w-full ${activeTab === 'webhook' ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                      <div className="p-4">
                        <div className="font-bold text-slate-800 text-base mb-1">
                          {activeTab === 'webhook' ? '构建任务 #1024 成功' : 'TestFlow Pro: Build #1024 Success'}
                        </div>
                        <div className="text-slate-500 text-xs mb-3">2026-02-07 10:30:00</div>
                        <div className="space-y-2 text-sm text-slate-600">
                           <div className="flex justify-between">
                              <span className="text-slate-400">项目:</span>
                              <span>Backend-API-Service</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-400">环境:</span>
                              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-xs font-medium">Production</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-400">执行人:</span>
                              <span>User.Name</span>
                           </div>
                           <div className="flex justify-between">
                              <span className="text-slate-400">耗时:</span>
                              <span>4m 12s</span>
                           </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-100">
                           <button className="w-full py-1.5 rounded border border-blue-600 text-blue-600 text-xs font-medium hover:bg-blue-50">
                              查看测试报告
                           </button>
                        </div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
