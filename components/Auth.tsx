
import React, { useState, useEffect } from 'react';
import { Profile, UserRole } from '../types';
import { supabase, TABLES } from '../services/supabase';

interface AuthProps {
  onLogin: (user: Profile) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'setup' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState<UserRole>('Mother');
  const [avatar, setAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=Mother`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any>(null);

  // Check for existing session and profile on mount or redirect back from Google
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthUser(user);
        const { data: profile } = await supabase
          .from(TABLES.PROFILES)
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile) {
          onLogin(profile);
        } else {
          // New User via Google or incomplete signup - Move to Setup
          setMode('setup');
          // Automatically pull Google Profile Info if available
          if (user.user_metadata?.full_name) setNickname(user.user_metadata.full_name);
          if (user.user_metadata?.avatar_url) setAvatar(user.user_metadata.avatar_url);
        }
      }
    };
    checkUser();
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use current origin as redirect for maximum compatibility
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError('Google Login failed. If you see a 403, please check if your email is added as a "Test User" in Google Cloud Console.');
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({ email, password });
        if (signupError) throw signupError;
        if (data.session) {
          setAuthUser(data.session.user);
          setMode('setup');
        } else {
          setMode('verify');
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) throw loginError;
        if (data.user) {
          setAuthUser(data.user);
          const { data: profile } = await supabase.from(TABLES.PROFILES).select('*').eq('id', data.user.id).maybeSingle();
          if (profile) onLogin(profile);
          else setMode('setup');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication Error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyCode.trim()) {
        setError("A Family Code is required to sync with your kitchen.");
        return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No active session found.");
      
      const newProfile: Profile = {
        id: user.id,
        name: nickname || role,
        role: role,
        avatar_url: avatar,
        family_code: familyCode.toLowerCase().trim()
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

  if (mode === 'verify') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-100">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Check Your Inbox</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">We've sent a verification link to <span className="font-bold text-gray-900">{email}</span>. Click it to unlock your kitchen.</p>
        <button type="button" onClick={() => setMode('login')} className="w-full py-5 bg-gray-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all">
            Back to Login
        </button>
      </div>
    );
  }

  if (mode === 'setup') {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col p-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="mb-10 mt-6 text-center">
          <h2 className="text-4xl font-black text-gray-900 leading-none tracking-tight">Almost<br/><span className="text-orange-500 text-5xl">There</span></h2>
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Personalize your profile</p>
        </div>
        <form onSubmit={handleProfileSubmit} className="space-y-6 flex-1">
          <div className="flex flex-col items-center mb-4">
            <div className="w-32 h-32 bg-gray-50 rounded-[3.5rem] overflow-hidden border-8 border-white shadow-2xl relative">
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
                  if(!authUser?.user_metadata?.avatar_url) setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${r}`); 
                }} 
                className={`py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${role === r ? 'bg-gray-900 text-white border-gray-900 shadow-xl' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200'}`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Nickname</label>
              <input required className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-800 focus:ring-2 focus:ring-orange-500" placeholder="e.g. Chef Sarah" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Family Code (Required to Sync)</label>
              <input required className="w-full bg-orange-50 border-none rounded-2xl p-5 font-black text-orange-600 uppercase tracking-widest" placeholder="e.g. HOME123" value={familyCode} onChange={(e) => setFamilyCode(e.target.value)} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-orange-100 active:scale-95 transition-all text-sm uppercase tracking-[0.2em]">
            {loading ? 'Joining Kitchen...' : 'Enter My Kitchen'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col items-center justify-center p-10 animate-in fade-in duration-700">
      <div className="mb-14 text-center">
        <div className="w-24 h-24 bg-orange-500 rounded-[2.8rem] flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(249,115,22,0.3)] animate-bounce-slow">
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">MY KITCHEN</h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Family Hub</p>
      </div>

      <div className="w-full space-y-8">
        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 text-gray-800 font-black py-5 rounded-[2.5rem] shadow-sm hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98] uppercase tracking-widest text-[10px]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">or email</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && <div className="p-5 bg-red-50 text-red-600 rounded-3xl text-[10px] font-black uppercase text-center border border-red-100 leading-relaxed">{error}</div>}
          
          <div className="space-y-3">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-semibold" placeholder="Email Address" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-sm font-semibold" placeholder="Password" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl active:scale-95 transition-all uppercase tracking-[0.2em] text-[10px]">
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Join Now')}
          </button>
          
          <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4">
            {mode === 'login' ? "New around here? Create Account" : "Back to Sign In"}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite; }
      `}</style>
    </div>
  );
};

export default Auth;
