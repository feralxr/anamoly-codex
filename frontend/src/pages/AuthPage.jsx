import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { api } from '../api';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ username, password }) });
      setAuth(data);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <main className="max-w-xl mx-auto p-6">
        <form onSubmit={submit} className="border border-red-900 p-6 space-y-4 bg-stone-950">
          <h1 className="text-2xl glitch text-lime-300">TERMINAL AUTH // {mode.toUpperCase()}</h1>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="USERNAME" className="w-full bg-black border border-stone-700 p-2" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="PASSWORD" className="w-full bg-black border border-stone-700 p-2" />
          {error && <p className="text-red-400">{error}</p>}
          <button className="btn-terminal w-full" type="submit">{mode === 'login' ? 'ENTER' : 'REGISTER'}</button>
          <button className="text-xs text-stone-400" type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            Switch to {mode === 'login' ? 'register' : 'login'}
          </button>
        </form>
      </main>
    </Layout>
  );
}
