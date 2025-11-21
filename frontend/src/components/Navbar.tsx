import React from 'react';
import { BookOpen, LayoutDashboard, FileText, Users, LifeBuoy, Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { User, Theme, ViewState } from '../types';

interface NavbarProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  user: User;
  theme: Theme;
  toggleTheme: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  view, 
  setView, 
  user, 
  theme, 
  toggleTheme, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  handleLogout 
}) => {
  const NavBtn = ({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon: React.ReactNode }) => (
    <button 
      onClick={onClick}
      className={`flex items-center text-sm font-medium transition-all duration-200 transform hover:scale-105 ${active ? 'text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-lg' : `text-slate-500 hover:text-blue-500 dark:text-slate-400`}`}
    >
      {icon}
      {label}
    </button>
  );

  const MobileNavBtn = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`block w-full text-left py-3 px-4 rounded-lg transition text-slate-900 dark:text-slate-100 hover:bg-white/5`}
    >
      {label}
    </button>
  );

  return (
    <nav className={`border-b sticky top-0 z-50 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Area */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group animate-in slide-in-from-left duration-700" 
            onClick={() => setView('dashboard')}
          >
            <div className={`p-1.5 rounded-lg transition-transform duration-300 group-hover:scale-110 ${theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <BookOpen className="text-blue-500" size={20} />
            </div>
            <span className={`font-bold text-lg tracking-tight group-hover:text-blue-500 transition ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
              DocuMind
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8 animate-in slide-in-from-top duration-500 delay-200 fill-mode-backwards">
            <NavBtn label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={16} className="mr-2"/>} />
            <NavBtn label="Library" active={view === 'library'} onClick={() => setView('library')} icon={<FileText size={16} className="mr-2"/>} />
            <NavBtn label="Community" active={view === 'community'} onClick={() => setView('community')} icon={<Users size={16} className="mr-2"/>} />
            <NavBtn label="Support" active={view === 'support'} onClick={() => setView('support')} icon={<LifeBuoy size={16} className="mr-2"/>} />
            
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3 animate-in slide-in-from-right duration-700 delay-100">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition hover:bg-white/10 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-100' : 'text-slate-500 hover:text-slate-900'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border border-white/20 transition-transform hover:scale-105 cursor-default">
                {user?.name.charAt(0)}
              </div>
              <button onClick={handleLogout} className={`transition hover:text-red-500 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                <LogOut size={18} />
              </button>
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleTheme} className={`p-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t p-4 space-y-2 animate-in slide-in-from-top-5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <MobileNavBtn label="Dashboard" onClick={() => {setView('dashboard'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="My Library" onClick={() => {setView('library'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="Community" onClick={() => {setView('community'); setMobileMenuOpen(false)}} />
          <MobileNavBtn label="Support" onClick={() => {setView('support'); setMobileMenuOpen(false)}} />
          <div className={`h-px w-full my-2 ${theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
          <button onClick={handleLogout} className="w-full text-left py-3 px-4 text-red-400 rounded-lg hover:bg-white/5">Sign Out</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;