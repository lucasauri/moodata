import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Milk, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-agro-green-800 via-agro-green-700 to-agro-green-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Milk size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AgroLeite</h1>
          <p className="text-agro-green-200 text-sm mt-1">Gestão Rural Leiteira</p>
        </div>

        {/* Card de login */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Entrar na sua conta</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* E-mail */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agro-green-500 transition-colors"
              />
            </div>

            {/* Senha */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-agro-green-500 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2.5 text-sm"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Botão */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-agro-green-600 text-white rounded-xl py-3.5 font-bold text-sm active:bg-agro-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-5">
            Problemas para entrar? Fale com o administrador.
          </p>
        </div>

        {/* Rodapé */}
        <p className="text-center text-agro-green-300 text-xs mt-6">
          AgroLeite v1.1 · Dados sincronizados na nuvem
        </p>
      </motion.div>
    </div>
  );
}
