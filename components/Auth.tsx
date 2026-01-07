
import React, { useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { supabase, TABLES } from '../services/supabase';

interface AuthProps {
  onLogin: (user: Profile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'setup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<UserRole>('Mother');
  const [avatar, setAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=Mother`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          onLogin(profile);
        } else {
          setMode('setup');
        }
      }
    };
    checkUser();
  }, [onLogin]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (signupError) {
          // If user already exists, try to log them in instead
          if (signupError.message.includes('already registered')) {
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (loginError) throw loginError;
            if (loginData.user) {
              const { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', loginData.user.id).maybeSingle();
              if (profile) onLogin(profile);
              else setMode('setup');
              return;
            }
          }
          throw signupError;
        }
        
        if (data.user) {
          setMode('setup');
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (data.user) {
          const { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', data.user.id).maybeSingle();
          if (profile) onLogin(profile);
          else setMode('setup');
        }
      }
    } catch (err: any) {
      if (err.message.includes('confirmation email')) {
        setError("Supabase is trying to send an email. Please go to Supabase Dashboard > Auth > Providers > Email and turn OFF 'Confirm Email'.");
      } else {
        setError(err.message || 'Authentication Error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = familyCode.trim().toLowerCase();
    if (!cleanCode) {
        setError("A Family Code is required. Share this code with your family members.");
        return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired. Please sign in again.");
      
      const newProfile: Profile = {
        id: user.id,
        name: nickname || role,
        role: role,
        avatar_url: avatar,
        family_code: cleanCode
      };

      const { error: upsertError } = await supabase.from(TABLES.PROFILES).upsert(newProfile);
      if (upsertError) throw upsertError;
      onLogin(newProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'setup') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col p-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="mb-10 mt-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 leading-none tracking-tight">Your<br/><span className="text-orange-500">Kitchen</span></h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Enter your family code to sync</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-6 flex-1">
          <div className="flex flex-col items-center mb-4">
            <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl relative">
              <img src={avatar} className="w-full h-full object-cover" alt="Avatar" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {(['Mother', 'Father', 'Son', 'Daughter'] as UserRole[]).map((r) => (
              <button 
                key={r} 
                type="button" 
                onClick={() => { 
                  setRole(r); 
                  setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${r}`); 
                }} 
                className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${role === r ? 'bg-gray-900 text-white border-gray-900 shadow-lg' : 'bg-white text-gray-400 border-gray-50'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nickname</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl p-4 font-bold text-gray-800" placeholder="e.g. Sarah" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Family Code (Shared Secret)</label>
              <input required className="w-full bg-orange-50 border-none rounded-2xl p-4 font-black text-orange-600 uppercase tracking-widest" placeholder="e.g. SMITHHOUSE" value={familyCode} onChange={(e) => setFamilyCode(e.target.value)} />
              <p className="text-[8px] text-gray-400 mt-1 px-1">Give this code to your family so you can see each other's meals.</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all text-sm uppercase tracking-[0.2em]">
            {loading ? 'Entering...' : 'Start Cooking'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col items-center justify-center p-10 animate-in fade-in duration-500">
      <div className="mb-14 text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-2xl">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">MY KITCHEN</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Family Hub</p>
      </div>

      <div className="w-full space-y-8">
        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100 animate-shake leading-relaxed">
              {error}
            </div>
          )}
          
          <div className="space-y-3">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-500" placeholder="Email" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-semibold focus:ring-2 focus:ring-orange-500" placeholder="Password" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-black py-5 rounded-[2.5rem] shadow-xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[11px] mt-4">
            {loading ? 'Checking...' : (mode === 'login' ? 'Sign In' : 'Create Kitchen Account')}
          </button>
          
          <div className="text-center pt-4">
            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
              {mode === 'login' ? "New here? Create Account" : "Already have an account? Sign In"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default Auth;
