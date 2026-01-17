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
        <div className="p-6 border-b border-white/10 flex flex-col items-center">
          <div className="w-32 h-20 mb-4">
            <svg viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-full">
              <g fill="none" stroke="#d4af37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 100 80 Q 120 40 150 60 Q 130 70 140 100"/>
                <path d="M 150 60 L 200 20 L 250 60"/>
                <path d="M 250 60 Q 270 40 300 80 Q 280 70 270 100"/>
                <path d="M 50 100 Q 200 100 350 100"/>
                <path d="M 350 100 Q 500 100 750 100"/>
              </g>
              <text x="400" y="150" fontFamily="serif" fontSize="48" fontWeight="bold" fill="#d4af37" textAnchor="middle" letterSpacing="3">
                PRESTIGE
              </text>
              <text x="400" y="175" fontFamily="serif" fontSize="32" fill="#d4af37" textAnchor="middle" letterSpacing="8">
                JORDAN ELITE
              </text>
              <g fill="none" stroke="#d4af37" strokeWidth="2" opacity="0.7">
                <path d="M 200 185 Q 250 180 300 185"/>
                <path d="M 500 185 Q 550 180 600 185"/>
              </g>
            </svg>
          </div>
          <h1 className="text-sm font-bold text-gold-500 tracking-wider text-center font-serif hidden">
              PRESTIGE<br/>
              <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Jordan Elite</span>
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