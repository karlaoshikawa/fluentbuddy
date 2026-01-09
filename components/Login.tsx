import React, { useState } from 'react';
import { Login as LoginIcon, Password, CheckmarkFilled, Warning } from '@carbon/icons-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validUsername = import.meta.env.VITE_APP_USERNAME;
    const validPassword = import.meta.env.VITE_APP_PASSWORD;

    if (username === validUsername && password === validPassword) {
      localStorage.setItem('fluentbuddy_auth', 'true');
      onLogin();
    } else {
      setError('Usuário ou senha incorretos');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-xl mb-4">
            <LoginIcon size={32} className="text-slate-700" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            FluentBuddy
          </h1>
          <p className="text-slate-600 text-sm">
            Professional Tech English
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-gray-50"
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-gray-50"
              placeholder="Digite sua senha"
            />
          </div>

          {error && (
            <div className="bg-slate-100 border border-slate-300 text-slate-800 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
              <Warning size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <LoginIcon size={20} />
            Entrar
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-slate-500">
          <p>Aprenda inglês com IA em tempo real</p>
        </div>
      </div>
    </div>
  );
}
