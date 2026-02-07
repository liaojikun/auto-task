import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FileJson, CalendarClock, Bell, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};

export const Layout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-slate-800">TestFlow Pro</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label="任务看板" />
          <NavItem to="/templates" icon={<FileJson size={20} />} label="执行模板" />
          <NavItem to="/schedule" icon={<CalendarClock size={20} />} label="定时调度" />
          <NavItem to="/notifications" icon={<Bell size={20} />} label="消息配置" />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2 text-slate-500 text-xs">
            <Settings size={16} />
            <span>系统设置</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-lg font-semibold text-slate-800">
             {/* This could be dynamic based on route, for now static or breadcrumb */}
             工作台
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <span className="text-sm text-slate-600">Admin User</span>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
