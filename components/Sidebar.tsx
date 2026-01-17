import React from 'react';
import { LayoutDashboard, Car, Key, History, Wrench, LogOut, X, ShieldCheck, Calendar, Bell, Sun, Moon } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onReset: () => void;
  isOpen: boolean;
  onClose: () => void;
  onNotificationsClick?: () => void;
  onThemeToggle?: () => void;
  isDarkMode?: boolean;
  notificationCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, onReset, isOpen, onClose, onNotificationsClick, onThemeToggle, isDarkMode, notificationCount = 0 }) => {
  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: <LayoutDashboard size={20} /> },
    { id: 'fleet', label: 'الأسطول', icon: <Car size={20} /> },
    { id: 'rentals', label: 'العقود والتاجير', icon: <Key size={20} /> },
    { id: 'availability', label: 'جدول التوافر', icon: <Calendar size={20} /> },
    { id: 'maintenance', label: 'الصيانة', icon: <Wrench size={20} /> },
    { id: 'history', label: 'السجل', icon: <History size={20} /> },
  ];

  const sidebarClasses = `
    w-64 h-screen bg-black-900 border-l border-white/10 flex flex-col fixed right-0 top-0 z-50
    transition-transform duration-300 ease-in-out shadow-[10px_0_30px_rgba(0,0,0,0.5)]
    ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
  `;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={sidebarClasses}>
        <div className="p-8 border-b border-white/10 flex flex-col items-center">
          <div className="mb-4 p-3 bg-gradient-to-br from-gold-600 to-gold-400 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <ShieldCheck size={40} className="text-black-900" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider text-center flex-1 font-serif">
              PRESTIGE<br/>
              <span className="text-gold-500 text-[10px] font-bold tracking-[0.4em] uppercase">Jordan Elite</span>
          </h1>
          <button onClick={onClose} className="lg:hidden absolute top-4 left-4 text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                onClose();
              }}
              className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 group ${
                activeTab === item.id
                  ? 'bg-gradient-to-l from-gold-500 to-gold-600 text-black-900 font-bold shadow-lg shadow-gold-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`${activeTab === item.id ? 'text-black-900' : 'text-gold-500 group-hover:scale-110 transition-transform'}`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black-800/50 space-y-2">
          {onNotificationsClick && (
            <button 
              onClick={onNotificationsClick}
              className="w-full flex items-center gap-4 px-4 py-3 text-gold-400 hover:bg-gold-500/10 rounded-lg transition-colors text-sm relative"
            >
              <Bell size={18} />
              <span>الإشعارات</span>
              {notificationCount > 0 && (
                <span className="absolute left-3 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          )}
          {onThemeToggle && (
            <button 
              onClick={onThemeToggle}
              className="w-full flex items-center gap-4 px-4 py-3 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors text-sm"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{isDarkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
            </button>
          )}
          <button 
            onClick={onReset}
            className="w-full flex items-center gap-4 px-4 py-3 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors text-sm"
          >
            <ShieldCheck size={18} />
            <span>إعادة ضبط النظام</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
          >
            <LogOut size={18} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;