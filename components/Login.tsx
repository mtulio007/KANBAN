import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'Tulio' && password === '124578') {
      onLogin();
    } else {
      setError('Credenciais incorretas. Use Tulio / 124578');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url("/bg.jpg")' }}
    >
      <div className="absolute inset-0 bg-black/20"></div> {/* overlay */}

      <div className="relative z-10 w-full max-w-[400px] p-8 sm:p-12 mx-4 rounded-3xl bg-transparent border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <h2 className="text-3xl font-bold text-center text-white mb-8 tracking-wider">LOGIN</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              className="w-full pl-8 py-2 bg-transparent border-0 border-b border-gray-400 text-white placeholder-transparent focus:ring-0 focus:border-blue-400 peer transition-colors"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label className="absolute left-8 -top-3.5 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-blue-400 peer-focus:text-sm">
              Username
            </label>
          </div>

          <div className="relative pt-4">
            <div className="absolute inset-y-0 left-0 pl-1 flex items-center pt-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="password"
              className="w-full pl-8 py-2 bg-transparent border-0 border-b border-gray-400 text-white placeholder-transparent focus:ring-0 focus:border-blue-400 peer transition-colors"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label className="absolute left-8 top-0 text-gray-300 text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-300 peer-placeholder-shown:top-6 peer-focus:top-0 peer-focus:text-blue-400 peer-focus:text-sm">
              Password
            </label>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-blue-500/30"
            >
              SIGN IN
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-300">
          New here? <a href="#" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">Create Account</a>
        </div>
      </div>
    </div>
  );
};
