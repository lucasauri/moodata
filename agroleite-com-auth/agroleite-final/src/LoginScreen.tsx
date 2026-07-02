import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader, ArrowRight, UserPlus, BarChart3, ShieldCheck, Activity, Milk, Settings, Leaf } from 'lucide-react';
import { login } from './auth';
import { AppUser } from './types';

interface Props {
  onLogin: (user: AppUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success && result.user) {
      onLogin(result.user);
    } else {
      setError(result.error || 'Erro ao entrar.');
    }
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7f5] relative font-sans flex flex-col">
      {/* Background Image Area */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0 overflow-hidden">
        <img 
          src="/bg-cow.png" 
          alt="Cow Background" 
          className="w-full h-full object-cover object-center opacity-90"
        />
        {/* Top-down gradient to fade the image */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8faf9]/95 via-[#f8faf9]/40 to-[#083F2B]/40"></div>
      </div>

      {/* Background Graphic Overlays */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
         {/* Top White Curve Graphic - Made slightly transparent */}
         <svg viewBox="0 0 1440 650" className="absolute top-0 left-0 w-full h-[65vh] drop-shadow-xl z-10" preserveAspectRatio="none">
           <path d="M0,0 L1440,0 L1440,500 C1000,750 400,250 0,600 Z" fill="rgba(248, 250, 249, 0.85)" />
         </svg>
         
         {/* Bottom Dark Green Curve Graphic */}
         <div className="absolute bottom-0 left-0 w-full h-[55%] bg-[#083F2B] z-0" style={{ borderTopLeftRadius: '100% 30%', borderTopRightRadius: '100% 30%' }}></div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-3 mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[400px] mx-auto flex flex-col items-center"
        >
          {/* Logo Area */}
          <div className="text-center mb-2">
            <div className="flex justify-center mb-1">
              <img 
                 src="/logo.png" 
                 alt="MooData" 
                 className="w-20 h-20 object-contain mix-blend-multiply"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                   document.getElementById('fallback-logo')!.style.display = 'flex';
                 }}
              />
              <div id="fallback-logo" className="hidden flex-col items-center justify-center text-[#083F2B]">
                 {/* Ícone de fallback caso o logo.png não seja encontrado */}
                 <Leaf size={56} strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-[32px] font-extrabold text-[#083F2B] tracking-tight leading-none mt-1">MooData</h1>
            
            <div className="flex items-center justify-center gap-2 my-1">
              <div className="h-[1px] w-12 bg-[#083F2B]/20"></div>
              <p className="text-[#083F2B] font-bold text-sm tracking-wide">Gestão Rural Leiteira</p>
              <div className="h-[1px] w-12 bg-[#083F2B]/20"></div>
            </div>
            
            <p className="text-[#168B5C] font-semibold mt-1 max-w-[280px] mx-auto leading-snug text-sm">
              Dados que transformam sua produção em resultados.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-[28px] p-5 w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#E5F3EB] flex items-center justify-center text-[#168B5C]">
                <Leaf size={24} />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">Bem-vindo(a)!</h2>
                <p className="text-[13px] font-medium text-slate-500">Faça login para continuar</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div>
                <label className="text-[11px] font-bold text-[#0D5D3F] uppercase tracking-wider block mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#168B5C] focus:bg-white transition-all bg-slate-50 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="text-[11px] font-bold text-[#0D5D3F] uppercase tracking-wider block mb-1.5">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    autoComplete="current-password"
                    className="w-full border-2 border-slate-100 rounded-xl pl-11 pr-12 py-3 text-sm font-medium focus:outline-none focus:border-[#168B5C] focus:bg-white transition-all bg-slate-50 text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-2 hover:text-slate-600 transition-colors"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Links */}
              <div className="flex items-center justify-between text-xs mt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 w-3.5 h-3.5 text-[#083F2B] focus:ring-[#083F2B]"
                  />
                  <span className="text-slate-700 font-semibold">Lembrar-me</span>
                </label>
                <button type="button" className="text-[#168B5C] font-bold hover:underline">
                  Esqueci minha senha
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm font-medium"
                >
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#083F2B] text-white rounded-xl py-3 font-bold text-[15px] hover:bg-[#062c1e] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-between px-6 mt-2 shadow-lg shadow-[#083F2B]/20"
              >
                <span></span>
                <div className="flex items-center gap-2">
                  {loading ? <Loader size={20} className="animate-spin" /> : 'Entrar'}
                </div>
                {!loading && <ArrowRight size={20} />}
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="h-[1px] flex-1 bg-slate-200"></div>
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">ou</span>
                <div className="h-[1px] flex-1 bg-slate-200"></div>
              </div>

              <button
                type="button"
                className="w-full bg-white border-2 border-slate-200 text-[#083F2B] rounded-xl py-3 font-bold text-[14px] hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                Criar conta
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Footer Features Section */}
      <div className="relative z-10 pb-4 pt-1 px-4 mt-auto">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#a7f3d0] bg-white/5">
                <BarChart3 size={20} strokeWidth={1.5} />
              </div>
              <span className="text-white text-[10px] font-medium leading-tight">Indicadores<br/>em tempo real</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#a7f3d0] bg-white/5">
                <Activity size={20} strokeWidth={1.5} />
              </div>
              <span className="text-white text-[10px] font-medium leading-tight">Controle do<br/>rebanho</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#a7f3d0] bg-white/5">
                <Milk size={20} strokeWidth={1.5} />
              </div>
              <span className="text-white text-[10px] font-medium leading-tight">Produção<br/>leiteira</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl border border-white/20 flex items-center justify-center text-[#a7f3d0] bg-white/5">
                <Settings size={20} strokeWidth={1.5} />
              </div>
              <span className="text-white text-[10px] font-medium leading-tight">Gestão completa<br/>da sua fazenda</span>
            </div>
          </div>

          <div className="h-[1px] w-full bg-white/10 mb-4"></div>

          <div className="text-center space-y-2">
            <p className="text-white/80 text-xs font-medium">
              Problemas para entrar? <a href="#" className="text-white hover:underline font-bold">Fale com o administrador.</a>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[#a7f3d0] text-xs font-bold">
              <ShieldCheck size={16} />
              MooData v1.1 • Dados sincronizados na nuvem
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
