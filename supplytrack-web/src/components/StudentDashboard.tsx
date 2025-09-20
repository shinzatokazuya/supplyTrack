import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Recycle,
  Trophy,
  Gift,
  History,
  Plus,
  LogOut,
  User,
  Target,
  Award,
  TrendingUp,
  Calendar,
  Weight
} from "lucide-react";
import type { User as UserType, WasteType, Delivery, Reward } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { PreDeliveryForm } from "./PreDeliveryForm";
import { DeliveryHistory } from "./DeliveryHistory";
import { RewardsSection } from "./RewardsSection";
import { RankingSection } from "./RankingSection";
import { toast } from "sonner";

interface StudentDashboardProps {
  user: UserType;
  accessToken: string;
  onLogout: () => void;
  onUserUpdate: (user: UserType) => void;
}

interface DashboardStats {
  user_stats: UserType;
  rank: number;
  total_students: number;
}

export function StudentDashboard({ user, accessToken, onLogout, onUserUpdate }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadWasteTypes(),
        loadDeliveries(),
        loadRewards()
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
        onUserUpdate(data.user_stats);
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

  const loadDeliveries = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/deliveries`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveries(data.deliveries);
      }
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    }
  };

  const loadRewards = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/rewards`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards);
      }
    } catch (error) {
      console.error('Erro ao carregar recompensas:', error);
    }
  };

  const getNextRewardGoal = () => {
    const availableRewards = rewards.filter(r => r.points_required > user.points);
    return availableRewards.sort((a, b) => a.points_required - b.points_required)[0];
  };

  const getPendingDelivery = () => {
    return deliveries.find(d => d.status === 'pending_delivery');
  };

  const getProgressToNextReward = () => {
    const nextReward = getNextRewardGoal();
    if (!nextReward) return 100;
    return Math.min((user.points / nextReward.points_required) * 100, 100);
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
                <h1 className="text-xl font-semibold text-gray-900">EcoUSCS</h1>
                <p className="text-sm text-gray-600">Olá, {user.name}!</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold text-green-600">{user.points} pontos</span>
                </div>
                {stats && (
                  <p className="text-xs text-gray-500">
                    #{stats.rank} de {stats.total_students} alunos
                  </p>
                )}
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Entrega
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Recompensas
            </TabsTrigger>
            <TabsTrigger value="ranking" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Ranking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Pending Delivery Alert */}
            {getPendingDelivery() && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-orange-800">Entrega Pendente</h3>
                      <p className="text-sm text-orange-600">
                        Você tem uma entrega pré-cadastrada aguardando para ser levada ao ponto de coleta.
                      </p>
                      <p className="text-xs text-orange-500 mt-1">
                        Funcionamento: 8:00 às 17:00
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700"
                      onClick={() => setActiveTab('history')}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pontos Totais</p>
                      <p className="text-2xl font-bold text-green-600">{user.points}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Entregas Realizadas</p>
                      <p className="text-2xl font-bold text-blue-600">{user.total_deliveries}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Peso Total (kg)</p>
                      <p className="text-2xl font-bold text-purple-600">{user.total_weight.toFixed(1)}</p>
                    </div>
                    <Weight className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Posição no Ranking</p>
                      <p className="text-2xl font-bold text-orange-600">#{stats?.rank || '-'}</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress to Next Reward */}
            {getNextRewardGoal() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Próxima Meta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{getNextRewardGoal()?.name}</span>
                      <Badge variant="outline">
                        {user.points}/{getNextRewardGoal()?.points_required} pontos
                      </Badge>
                    </div>
                    <Progress value={getProgressToNextReward()} className="h-2" />
                    <p className="text-sm text-gray-600">
                      Faltam apenas {(getNextRewardGoal()?.points_required || 0) - user.points} pontos!
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    className="h-20 flex-col gap-2 bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab('delivery')}
                  >
                    <Plus className="h-6 w-6" />
                    Nova Entrega
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('rewards')}
                  >
                    <Gift className="h-6 w-6" />
                    Resgatar Prêmios
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('ranking')}
                  >
                    <Trophy className="h-6 w-6" />
                    Ver Ranking
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <PreDeliveryForm
              wasteTypes={wasteTypes}
              accessToken={accessToken}
              onSuccess={() => {
                loadDeliveries();
                setActiveTab('history');
                toast.success('Pré-cadastro realizado com sucesso!');
              }}
            />
          </TabsContent>

          <TabsContent value="history">
            <DeliveryHistory
              deliveries={deliveries}
              wasteTypes={wasteTypes}
              onRefresh={loadDeliveries}
            />
          </TabsContent>

          <TabsContent value="rewards">
            <RewardsSection
              rewards={rewards}
              userPoints={user.points}
              accessToken={accessToken}
              onRewardRedeemed={() => {
                loadStats();
                loadRewards();
              }}
            />
          </TabsContent>

          <TabsContent value="ranking">
            <RankingSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
