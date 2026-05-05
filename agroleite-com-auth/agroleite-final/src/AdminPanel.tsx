import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, UserPlus, Shield, ShieldOff, Trash2,
  Eye, EyeOff, X, Check, AlertCircle,
  Crown, User as UserIcon
} from 'lucide-react';
import { AppUser, UserRole } from './types';
import { getUsers, createUser, toggleUserActive, deleteUser } from './auth';

interface Props {
  currentUser: AppUser;
  onClose: () => void;
}

export default function AdminPanel({ currentUser, onClose }: Props) {
  const [users, setUsers]       = useState<AppUser[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Form state
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole]         = useState<UserRole>('user');
  const [farmName, setFarmName] = useState('');
  const [formError, setFormError] = useState('');

  async function refresh() {
    const list = await getUsers();
    setUsers(list);
  }

  useEffect(() => {
    refresh();
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setFormError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setFormError('');
    const result = await createUser({ name, email, password, role, farmName });
    setLoading(false);
    if (!result.success) {
      setFormError(result.error || 'Erro ao criar usuário.');
      return;
    }
    await refresh();
    setShowForm(false);
    setName(''); setEmail(''); setPassword(''); setFarmName(''); setRole('user');
    showToast('Usuário criado com sucesso!');
  }

  async function handleToggle(userId: string) {
    if (userId === currentUser.id) return;
    await toggleUserActive(userId);
    await refresh();
    showToast('Status atualizado.');
  }

  async function handleDelete(userId: string) {
    if (userId === currentUser.id) return;
    await deleteUser(userId);
    await refresh();
    setConfirmDelete(null);
    showToast('Usuário removido.');
  }

  const otherUsers = users.filter(u => u.id !== currentUser.id);
  const activeCount = users.filter(u => u.active).length;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-agro-green-700 text-white px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onClose} className="p-2 rounded-xl bg-white/20">
            <X size={20} />
          </button>
          <h1 className="font-bold text-lg">Gerenciar Usuários</h1>
          <button
            onClick={() => setShowForm(true)}
            className="p-2 rounded-xl bg-white/20"
          >
            <UserPlus size={20} />
          </button>
        </div>
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: users.length },
            { label: 'Ativos', value: activeCount },
            { label: 'Bloqueados', value: users.length - activeCount },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-2xl p-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-agro-green-100">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">

        {/* Usuário atual */}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Você</p>
        <UserCard user={currentUser} isSelf />

        {/* Demais usuários */}
        {otherUsers.length > 0 && (
          <>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 pt-2">
              Usuários ({otherUsers.length})
            </p>
            {otherUsers.map(user => (
              <UserCard
                key={user.id}
                user={user}
                onToggle={() => handleToggle(user.id)}
                onDelete={() => setConfirmDelete(user.id)}
              />
            ))}
          </>
        )}

        {otherUsers.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum outro usuário</p>
            <p className="text-sm">Toque em + para adicionar</p>
          </div>
        )}
      </div>

      {/* Modal: Criar usuário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white w-full rounded-t-3xl p-6 pb-10 max-h-[92vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
              <h2 className="text-xl font-bold mb-5">Novo Usuário</h2>

              <form onSubmit={handleCreate} className="space-y-4">
                <Field label="Nome completo *">
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    placeholder="João Silva"
                    className="input"
                  />
                </Field>

                <Field label="E-mail *">
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="joao@fazenda.com"
                    className="input"
                  />
                </Field>

                <Field label="Senha inicial *">
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="input pr-12"
                    />
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </Field>

                <Field label="Nome da Fazenda">
                  <input
                    value={farmName} onChange={e => setFarmName(e.target.value)}
                    placeholder="Fazenda Boa Vista (opcional)"
                    className="input"
                  />
                </Field>

                <Field label="Perfil">
                  <div className="grid grid-cols-2 gap-3">
                    {(['user', 'admin'] as UserRole[]).map(r => (
                      <button
                        key={r} type="button"
                        onClick={() => setRole(r)}
                        className={`py-3 rounded-xl border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-colors
                          ${role === r
                            ? 'border-agro-green-600 bg-agro-green-50 text-agro-green-700'
                            : 'border-slate-200 text-slate-500'}`}
                      >
                        {r === 'admin' ? <Crown size={16} /> : <UserIcon size={16} />}
                        {r === 'admin' ? 'Admin' : 'Usuário'}
                      </button>
                    ))}
                  </div>
                </Field>

                {formError && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-2.5 text-sm">
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit" disabled={loading}
                  className="w-full bg-agro-green-600 text-white rounded-xl py-3.5 font-bold disabled:opacity-60"
                >
                  {loading ? 'Criando...' : 'Criar Usuário'}
                </button>
                <button
                  type="button" onClick={() => setShowForm(false)}
                  className="w-full border-2 border-slate-200 text-slate-600 rounded-xl py-3 font-semibold"
                >
                  Cancelar
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Confirmar exclusão */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-center mb-2">Remover usuário?</h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                Todos os dados da fazenda deste usuário serão apagados permanentemente.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="w-full bg-red-500 text-white rounded-xl py-3 font-bold"
                >
                  Sim, remover
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="w-full border-2 border-slate-200 text-slate-600 rounded-xl py-3 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-agro-green-700 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
              <Check size={16} />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-componentes ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function UserCard({
  user, isSelf = false, onToggle, onDelete
}: {
  user: AppUser;
  isSelf?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border ${user.active ? 'border-agro-green-100' : 'border-red-100 opacity-75'}`}>
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0
          ${user.role === 'admin' ? 'bg-agro-green-600' : 'bg-slate-400'}`}>
          {user.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm truncate">{user.name}</p>
            {user.role === 'admin' && (
              <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-bold text-agro-green-700 bg-agro-green-50 px-2 py-0.5 rounded-full">
                <Crown size={10} /> Admin
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
          {user.farmName && (
            <p className="text-xs text-agro-green-600 font-medium truncate">{user.farmName}</p>
          )}
        </div>

        {/* Status badge */}
        <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full
          ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
          {user.active ? 'Ativo' : 'Bloqueado'}
        </span>
      </div>

      {/* Ações (apenas para outros usuários) */}
      {!isSelf && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <button
            onClick={onToggle}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors
              ${user.active
                ? 'bg-red-50 text-red-600 active:bg-red-100'
                : 'bg-green-50 text-green-700 active:bg-green-100'}`}
          >
            {user.active ? <ShieldOff size={14} /> : <Shield size={14} />}
            {user.active ? 'Bloquear' : 'Ativar'}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-500 active:bg-slate-200"
          >
            <Trash2 size={14} />
            Remover
          </button>
        </div>
      )}

      {isSelf && (
        <p className="text-xs text-slate-400 mt-2 text-center">Esta é sua conta</p>
      )}
    </div>
  );
}
