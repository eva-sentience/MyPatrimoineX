import React, { useState } from 'react';
import { UserProfile } from '../types';
import { storageService } from '../services/storageService';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthProps {
  onLogin: (user: UserProfile) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M24 12.276c0-.816-.073-1.603-.214-2.36H12.273v4.47h6.612c-.285 1.522-1.14 2.81-2.437 3.68l-.023.157 3.555 2.756.246.025c2.25-2.073 3.55-5.124 3.55-8.728"
    />
    <path
      fill="#34A853"
      d="M12.273 24c3.24 0 5.958-1.075 7.942-2.906l-3.778-2.938c-1.075.72-2.45 1.146-4.164 1.146-3.126 0-5.775-2.11-6.72-4.95l-.15.013-3.707 2.87-.05.168C3.74 21.32 7.73 24 12.273 24"
    />
    <path
      fill="#FBBC05"
      d="M5.553 14.352c-.244-.73-.383-1.51-.383-2.352 0-.843.14-1.623.383-2.352l-.006-.16-3.734-2.894-.123.06C.607 8.656 0 10.276 0 12.276c0 2.002.607 3.62 1.69 5.615l3.863-2.938"
    />
    <path
      fill="#4285F4"
      d="M12.273 4.91c1.762 0 3.346.605 4.59 1.793l3.425-3.426C18.227 1.187 15.513 0 12.273 0 7.73 0 3.74 2.68 1.69 6.66l3.863 2.94c.945-2.84 3.593-4.95 6.72-4.95"
    />
  </svg>
);

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'login' | '2fa'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network request
    setTimeout(() => {
      if (email.toLowerCase() === 'bnjm.elias@gmail.com' && password === 'Patrimoine75116!') {
        setStep('2fa');
        setIsLoading(false);
      } else {
        setError('Email ou mot de passe invalide.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleGoogleLogin = () => {
    setError('');
    setIsLoading(true);
    
    // Simulate Google OAuth flow
    setTimeout(() => {
      setEmail('bnjm.elias@gmail.com');
      setStep('2fa');
      setIsLoading(false);
    }, 1200);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length === 6) {
      setIsLoading(true);
      setTimeout(() => {
        const user: UserProfile = {
          id: 'user_' + Date.now(),
          email: 'bnjm.elias@gmail.com',
          isAuthenticated: true,
          hasSetup2FA: true,
          subscriptionTier: 'premium'
        };
        storageService.saveUser(user);
        onLogin(user);
      }, 800);
    } else {
      setError('Code de vérification invalide.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Patrimoine<span className="text-purple-500">X</span></h1>
          <p className="text-gray-400">Système de Gestion de Patrimoine Sécurisé</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10 shadow-2xl relative">
          
          {step === 'login' ? (
            <div className="space-y-6 animate-fade-in">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Adresse Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-3 text-gray-500 group-focus-within:text-purple-500 transition" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                      placeholder="investisseur@exemple.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 text-gray-500 group-focus-within:text-purple-500 transition" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                    <>Continuer <ArrowRight size={18} /></>
                  )}
                </button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#0a0a0a] text-gray-500">Ou continuer avec</span>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white/5 text-white font-medium py-3 rounded-xl hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <GoogleIcon />
                <span>Connexion avec Google</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-1 ring-green-500/30">
                  <ShieldCheck className="text-green-500" size={24} />
                </div>
                <h2 className="text-xl font-semibold text-white">Double Authentification</h2>
                <p className="text-sm text-gray-400 mt-2">Entrez le code à 6 chiffres envoyé à <br/><span className="text-white">{email}</span></p>
              </div>
              
              <div className="flex justify-center gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-3xl tracking-[0.5em] bg-black/50 border border-white/10 rounded-xl py-4 text-white outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition font-mono placeholder-gray-700"
                  placeholder="000000"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm justify-center">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 rounded-xl hover:from-green-500 hover:to-emerald-500 transition shadow-lg shadow-green-900/20 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Vérifier & Accéder"}
              </button>
              
              <button 
                onClick={() => { setStep('login'); setOtp(''); setError(''); }} 
                type="button" 
                className="w-full text-gray-500 text-sm hover:text-white transition"
              >
                Retour à la connexion
              </button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
               <Lock size={10} />
               Architecture Local-First. Zéro Donnée Serveur.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};