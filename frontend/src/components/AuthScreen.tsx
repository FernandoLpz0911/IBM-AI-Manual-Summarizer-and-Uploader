import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (e: React.FormEvent) => void;
  onNavigateToRegister: () => void;
  loading: boolean;
  error: string | null;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onNavigateToRegister, loading, error }) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 relative overflow-hidden font-sans">
    <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-black"></div>
    
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl shadow-2xl p-8 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-8">
        <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/50">
          <BookOpen className="text-white w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">DocuMind AI</h1>
        <p className="text-blue-200">Intelligent Document Analysis</p>
      </div>
      <form onSubmit={onLogin} className="space-y-4">
        
        {error && (
            <div className="bg-red-500 text-white text-sm p-3 rounded-lg text-center font-medium animate-in fade-in slide-in-from-top-2">
                {error}
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-blue-100">Email</label>
          <input 
            required 
            type="email" 
            name="email"
            className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" 
            placeholder="demo@example.com" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-blue-100">Password</label>
          <input 
            required 
            type="password" 
            name="password"
            className="mt-1 w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white outline-none placeholder-slate-400 transition" 
            placeholder="••••••••" 
          />
        </div>
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center shadow-lg">
          {loading ? <Loader2 className="animate-spin mr-2" /> : 'Sign In'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-slate-400 text-sm">
          Don't have an account?{' '}
          <button onClick={onNavigateToRegister} className="text-blue-400 hover:text-blue-300 font-medium transition">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  </div>
);

export default AuthScreen;