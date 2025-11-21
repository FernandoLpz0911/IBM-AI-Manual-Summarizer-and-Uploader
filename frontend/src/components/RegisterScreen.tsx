import React, { useState } from 'react';
import { BookOpen, User as UserIcon, Building, Loader2, Moon, Sun } from 'lucide-react';
import { Theme } from '../types';

interface RegisterScreenProps {
  onRegister: (e: React.FormEvent) => void;
  onNavigateToLogin: () => void;
  loading: boolean;
  // Optional: Add error display prop
  error: string | null;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onNavigateToLogin, loading, error }) => {
  const [preferredTheme, setPreferredTheme] = useState<Theme>('dark');

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black"></div>
      
      <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
            <BookOpen className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join DocuMind</h1>
          <p className="text-blue-200">Create your account</p>
        </div>
        
        {/* Error Display */}
        {error && (
            <div className="bg-red-500 text-white text-sm p-3 rounded-lg text-center font-medium mb-4">
                {error}
            </div>
        )}

        <form onSubmit={onRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100">Full Name</label>
            <div className="relative">
              <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="name" required type="text" className="mt-1 w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" placeholder="John Doe" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-100">Company Name</label>
             <div className="relative">
              <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input name="company" required type="text" className="mt-1 w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" placeholder="Acme Inc." />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-100">Email</label>
            <input name="email" required type="email" className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" placeholder="demo@example.com" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-blue-100">Password</label>
              <input 
                required 
                type="password" 
                name="password" {/* ✅ ADDED NAME */}
                className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" 
                placeholder="••••••" 
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-blue-100">Confirm Password</label>
              <input 
                required 
                type="password" 
                name="confirmPassword" {/* ✅ ADDED NAME */}
                className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" 
                placeholder="••••••" 
              />
            </div>
          </div>
          {/* ... Theme Preference Selection (Already correct) ... */}
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center shadow-lg mt-6">
            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <button onClick={onNavigateToLogin} className="text-blue-400 hover:text-blue-300 font-medium transition">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterScreen;