import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Recycle,
  CheckCircle,
  Clock,
  LogOut,
  Users,
  TrendingUp,
  Calendar,
  AlertCircle,
  FileText,
  Weight
} from "lucide-react";
import type { User as UserType, WasteType, Delivery } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PendingDeliveries } from "./PendingDeliveries";
import { ValidationHistory } from "./ValidationHistory";
import { StaffReports } from "./StaffReports";
import { toast } from "sonner";

interface StaffDashboardProps {
  user: UserType;
  accessToken: string;
  onLogout: () => void;
}

interface StaffStats {
  user_stats: UserType;
  pending_deliveries: number;
  today_validated: number;
}

export function StaffDashboard({ user, accessToken, onLogout }: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<StaffStats | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadWasteTypes()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadWasteTypes = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/waste-types`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWasteTypes(data.waste_types);
      }
    } catch (error) {
      console.error('Erro ao carregar tipos de resíduos:', error);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOperatingHours = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 8 && hour < 17;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-full">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">EcoUSCS - Funcionário</h1>
                <p className="text-sm text-gray-600">Olá, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{getCurrentTime()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${isOperatingHours() ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-500">
                    {isOperatingHours() ? 'Funcionamento' : 'Fora do horário'}
                  </span>
                </div>
              </div>
              <Button variant="outline" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes
              {stats && stats.pending_deliveries > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {stats.pending_deliveries}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Operating Hours Status */}
            <Card className={`border-2 ${isOperatingHours() ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${isOperatingHours() ? 'bg-green-600' : 'bg-orange-600'}`}>
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isOperatingHours() ? 'text-green-800' : 'text-orange-800'}`}>
                        {isOperatingHours() ? 'Ponto de Coleta Aberto' : 'Fora do Horário de Funcionamento'}
                      </h3>
                      <p className={`text-sm ${isOperatingHours() ? 'text-green-600' : 'text-orange-600'}`}>
                        Horário de funcionamento: 8:00 às 17:00
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Horário atual</p>
                    <p className="text-lg font-semibold">{getCurrentTime()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Entregas Pendentes</p>
                      <p className="text-2xl font-bold text-orange-600">{stats?.pending_deliveries || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Validadas Hoje</p>
                      <p className="text-2xl font-bold text-green-600">{stats?.today_validated || 0}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tipos de Resíduo</p>
                      <p className="text-2xl font-bold text-blue-600">{wasteTypes.length}</p>
                    </div>
                    <Recycle className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pending Deliveries Alert */}
            {stats && stats.pending_deliveries > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-orange-800">
                          {stats.pending_deliveries} entrega{stats.pending_deliveries > 1 ? 's' : ''} aguardando validação
                        </h3>
                        <p className="text-sm text-orange-600">
                          Acesse a aba "Pendentes" para validar as entregas dos alunos
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => setActiveTab('pending')}
                    >
                      Ver Pendentes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Waste Types Reference */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Resíduos Aceitos</CardTitle>
                <CardDescription>
                  Referência rápida para pontuação dos materiais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {wasteTypes.map((wasteType) => (
                    <div key={wasteType.id} className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: wasteType.color }}
                        />
                        <span className="font-medium text-sm">{wasteType.name}</span>
                      </div>
                      <Badge variant="outline">
                        {wasteType.points_per_kg} pts/kg
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>
                  Acesso rápido às principais funcionalidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    className="h-20 flex-col gap-2 bg-orange-600 hover:bg-orange-700"
                    onClick={() => setActiveTab('pending')}
                    disabled={!stats || stats.pending_deliveries === 0}
                  >
                    <Clock className="h-6 w-6" />
                    Validar Entregas
                    {stats && stats.pending_deliveries > 0 && (
                      <Badge className="bg-white text-orange-600">
                        {stats.pending_deliveries}
                      </Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('history')}
                  >
                    <CheckCircle className="h-6 w-6" />
                    Ver Histórico
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('reports')}
                  >
                    <FileText className="h-6 w-6" />
                    Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <PendingDeliveries
              accessToken={accessToken}
              wasteTypes={wasteTypes}
              onValidationComplete={() => {
                loadStats();
                toast.success('Entrega validada com sucesso!');
              }}
            />
          </TabsContent>

          <TabsContent value="history">
            <ValidationHistory
              accessToken={accessToken}
              wasteTypes={wasteTypes}
            />
          </TabsContent>

          <TabsContent value="reports">
            <StaffReports
              accessToken={accessToken}
              wasteTypes={wasteTypes}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
