import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Trophy,
  Medal,
  Award,
  RefreshCw,
  Users,
  TrendingUp,
  Target
} from "lucide-react";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";

interface RankingUser {
  position: number;
  name: string;
  course: string;
  points: number;
  total_deliveries: number;
  total_weight: number;
}

export function RankingSection() {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/ranking`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRanking(data.ranking);
      } else {
        toast.error('Erro ao carregar ranking');
      }
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center font-bold text-gray-600">#{position}</span>;
    }
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando ranking...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600" />
                Ranking de Sustentabilidade
              </CardTitle>
              <CardDescription>
                Os alunos que mais contribuem para o meio ambiente
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadRanking}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Top 3 Highlight */}
      {ranking.length >= 3 && (
        <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-800">🏆 Pódio dos Campeões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ranking.slice(0, 3).map((user) => (
                <div key={user.position} className={`p-4 rounded-lg border ${getPositionStyle(user.position)}`}>
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      {getPositionIcon(user.position)}
                    </div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.course}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-1">
                        <Trophy className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-700">{user.points} pts</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.total_deliveries} entregas • {user.total_weight.toFixed(1)} kg
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Ranking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Ranking Completo
          </CardTitle>
          <CardDescription>
            Top 20 alunos com maior pontuação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum aluno no ranking ainda</p>
              <p className="text-sm">Seja o primeiro a contribuir!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.map((user) => (
                <div key={user.position} className={`p-4 rounded-lg border ${getPositionStyle(user.position)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {getPositionIcon(user.position)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.course}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Pontos</p>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-green-700">{user.points}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500">Entregas</p>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-700">{user.total_deliveries}</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm text-gray-500">Peso (kg)</p>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold text-purple-700">{user.total_weight.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement Info */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🌱 Impacto Coletivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-green-600">Total de Participantes</p>
              <p className="text-2xl font-bold text-green-700">{ranking.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600">Total de Pontos</p>
              <p className="text-2xl font-bold text-green-700">
                {ranking.reduce((sum, user) => sum + user.points, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-green-600">Total Reciclado (kg)</p>
              <p className="text-2xl font-bold text-green-700">
                {ranking.reduce((sum, user) => sum + user.total_weight, 0).toFixed(1)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-blue-800">💪 Continue Participando!</h3>
            <p className="text-sm text-blue-600">
              Cada entrega de resíduo faz diferença para o meio ambiente e para sua posição no ranking.
            </p>
            <p className="text-sm text-blue-600">
              Convide seus colegas para participarem também e vejam quem consegue ser mais sustentável!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
