import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { logErro } from '../utils/seguranca';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  role: 'ADMIN' | 'CLIENTE';
}

interface AuthContextType {
  token: string | null;
  user: UsuarioLogado | null;
  login: (token: string, user: UsuarioLogado) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UsuarioLogado | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  // NOVO: Estado de carregamento global para segurar a tela durante a checagem
  const [loadingContext, setLoadingContext] = useState(true);

  // NOVO: Effect que roda sempre que a aplicação abre (F5 ou primeira visita)
  useEffect(() => {
    async function validarSessao() {
      const tokenAtual = localStorage.getItem('token');
      
      if (tokenAtual) {
        try {
          // Revalida o token no backend a cada boot para não confiar apenas no
          // que está guardado no localStorage.
          const usuarioAtualizado = await authService.me();
          setUser(usuarioAtualizado);
          localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
        } catch (err) {
          logErro('auth:validarSessao', err);
          logout();
        }
      }
      setLoadingContext(false);
    }

    validarSessao();
  }, []);

  function login(newToken: string, newUser: UsuarioLogado) {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }

  // Se ainda estiver checando o token no backend, mostra uma tela de carregamento minimalista
  if (loadingContext) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-gray-800 border-t-2 border-t-[#10b981] animate-spin" />
        <span className="text-xs font-mono text-gray-500 tracking-widest uppercase animate-pulse">
          Autenticando CoreX...
        </span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      token,
      user,
      login,
      logout,
      isAuthenticated: !!token,
      isAdmin: user?.role === 'ADMIN'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}