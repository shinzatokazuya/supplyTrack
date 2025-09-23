import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { LoginForm } from "./components/LoginForm";
import { RegisterForm } from "./components/RegisterForm";
import { StudentDashboard } from "./components/StudentDashboard";
import { StaffDashboard } from "./components/StaffDashboard";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { projectId, publicAnonKey } from './utils/supabase/info';

export interface User {
  id: string;
  email: string;
  name: string;
  ra: string;
  course: string;
  user_type: 'student' | 'staff';
  points: number;
  total_deliveries: number;
  total_weight: number;
  created_at: string;
  badges: string[];
}

export interface WasteType {
  id: string;
  name: string;
  points_per_kg: number;
  color: string;
}

export interface Delivery {
  id: string;
  user_id: string;
  waste_items: WasteItem[];
  actual_waste_items?: WasteItem[];
  notes: string;
  status: 'pending_delivery' | 'validated';
  created_at: string;
  validated_at?: string;
  validated_by?: string;
  validation_notes?: string;
  expected_points: number;
  actual_points?: number;
  user_info?: User;
}

export interface WasteItem {
  waste_type_id: string;
  estimated_weight: number;
  actual_weight?: number;
}

export interface Reward {
  id: string;
  name: string;
  points_required: number;
  type: 'discount' | 'hours' | 'item' | 'certificate';
  value: number;
}

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export default function App() {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSystem();
    checkExistingSession();
  }, []);

  const initializeSystem = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        console.log('Sistema já inicializado ou erro na inicialização');
      }
    } catch (error) {
      console.log('Erro ao inicializar sistema:', error);
    }
  };

  const checkExistingSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Erro ao verificar sessão:', error);
        setLoading(false);
        return;
      }

      if (session?.access_token) {
        await loadUserProfile(session.access_token);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão existente:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (token: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setAccessToken(token);
        setCurrentView('dashboard');
      } else {
        console.error('Erro ao carregar perfil do usuário');
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      await supabase.auth.signOut();
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        toast.error('Erro ao fazer login: ' + error.message);
        return;
      }

      if (data.session?.access_token) {
        await loadUserProfile(data.session.access_token);
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast.error('Erro interno do servidor');
    }
  };

  const handleRegister = async (userData: {
    email: string;
    password: string;
    name: string;
    ra: string;
    course: string;
    user_type: 'student' | 'staff';
  }) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error('Erro ao criar conta: ' + data.error);
        return;
      }

      toast.success('Conta criada com sucesso! Faça login para continuar.');
      setCurrentView('login');
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro interno do servidor');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAccessToken(null);
      setCurrentView('login');
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {currentView === 'login' && (
        <LoginForm
          onLogin={handleLogin}
          onSwitchToRegister={() => setCurrentView('register')}
        />
      )}

      {currentView === 'register' && (
        <RegisterForm
          onRegister={handleRegister}
          onSwitchToLogin={() => setCurrentView('login')}
        />
      )}

      {currentView === 'dashboard' && user && accessToken && (
        <>
          {user.user_type === 'student' ? (
            <StudentDashboard
              user={user}
              accessToken={accessToken}
              onLogout={handleLogout}
              onUserUpdate={setUser}
            />
          ) : (
            <StaffDashboard
              user={user}
              accessToken={accessToken}
              onLogout={handleLogout}
            />
          )}
        </>
      )}

      <Toaster richColors position="top-right" />
    </div>
  );
}
