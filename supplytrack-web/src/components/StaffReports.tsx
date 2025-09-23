import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  Recycle,
  Calendar,
  Award,
  RefreshCw,
  Download
} from "lucide-react";
import type { WasteType } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";

interface StaffReportsProps {
  accessToken: string;
  wasteTypes: WasteType[];
}

interface RankingUser {
  position: number;
  name: string;
  course: string;
  points: number;
  total_deliveries: number;
  total_weight: number;
}

export function StaffReports({ accessToken, wasteTypes }: StaffReportsProps) {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      // Load ranking data for reports
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/ranking`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRanking(data.ranking);
      } else {
        toast.error('Erro ao carregar dados dos relatórios');
      }
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      toast.error('Erro ao carregar dados dos relatórios');
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    return {
      totalStudents: ranking.length,
      totalPoints: ranking.reduce((sum, user) => sum + user.points, 0),
      totalDeliveries: ranking.reduce((sum, user) => sum + user.total_deliveries, 0),
      totalWeight: ranking.reduce((sum, user) => sum + user.total_weight, 0),
      avgPointsPerStudent: ranking.length > 0 ? ranking.reduce((sum, user) => sum + user.points, 0) / ranking.length : 0,
      avgDeliveriesPerStudent: ranking.length > 0 ? ranking.reduce((sum, user) => sum + user.total_deliveries, 0) / ranking.length : 0
    };
  };

  const getTopPerformers = () => {
    return ranking.slice(0, 5);
  };

  const getCourseStats = () => {
    const courseMap = new Map();

    ranking.forEach(user => {
      if (!courseMap.has(user.course)) {
        courseMap.set(user.course, {
          course: user.course,
          students: 0,
          totalPoints: 0,
          totalDeliveries: 0,
          totalWeight: 0
        });
      }

      const courseData = courseMap.get(user.course);
      courseData.students += 1;
      courseData.totalPoints += user.points;
      courseData.totalDeliveries += user.total_deliveries;
      courseData.totalWeight += user.total_weight;
    });

    return Array.from(courseMap.values()).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getEnvironmentalImpact = () => {
    const stats = getTotalStats();
    return {
      // Estimativas baseadas em dados de reciclagem
      co2Saved: Math.round(stats.totalWeight * 2.3), // kg CO2 economizado
      treesEquivalent: Math.round(stats.totalWeight * 0.024), // árvores equivalentes
      energySaved: Math.round(stats.totalWeight * 1.2), // kWh economizado
      waterSaved: Math.round(stats.totalWeight * 15) // litros de água economizada
    };
  };

  const stats = getTotalStats();
  const topPerformers = getTopPerformers();
  const courseStats = getCourseStats();
  const environmentalImpact = getEnvironmentalImpact();

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
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
                <BarChart3 className="h-5 w-5 text-green-600" />
                Relatórios e Estatísticas
              </CardTitle>
              <CardDescription>
                Dados consolidados do programa de sustentabilidade
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadReportsData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Participantes ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Pontos</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalPoints}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Média: {stats.avgPointsPerStudent.toFixed(1)} por aluno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Entregas</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalDeliveries}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Média: {stats.avgDeliveriesPerStudent.toFixed(1)} por aluno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Peso Total (kg)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.totalWeight.toFixed(1)}</p>
              </div>
              <Recycle className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Material reciclado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">🌱 Impacto Ambiental</CardTitle>
          <CardDescription className="text-green-600">
            Estimativa do benefício ambiental gerado pelo programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">{environmentalImpact.co2Saved}</p>
              <p className="text-sm text-green-600">kg CO₂ economizado</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">{environmentalImpact.treesEquivalent}</p>
              <p className="text-sm text-green-600">árvores equivalentes</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">{environmentalImpact.energySaved}</p>
              <p className="text-sm text-green-600">kWh economizado</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border border-green-200">
              <p className="text-2xl font-bold text-green-700">{environmentalImpact.waterSaved}</p>
              <p className="text-sm text-green-600">litros água economizada</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            Top 5 Alunos
          </CardTitle>
          <CardDescription>
            Estudantes com melhor desempenho no programa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((user, index) => (
              <div key={user.position} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <span className="font-bold text-yellow-700">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.course}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{user.points} pts</p>
                  <p className="text-xs text-gray-500">
                    {user.total_deliveries} entregas • {user.total_weight.toFixed(1)} kg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Rankings */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking por Curso</CardTitle>
          <CardDescription>
            Desempenho agregado por curso acadêmico
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseStats.map((course, index) => (
              <div key={course.course} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{course.course}</h3>
                    <p className="text-sm text-gray-600">{course.students} alunos participantes</p>
                  </div>
                  <Badge variant={index < 3 ? "default" : "outline"}>
                    #{index + 1}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total de Pontos</p>
                    <p className="font-semibold text-green-600">{course.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Entregas</p>
                    <p className="font-semibold text-blue-600">{course.totalDeliveries}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Peso Total</p>
                    <p className="font-semibold text-purple-600">{course.totalWeight.toFixed(1)} kg</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Waste Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Resíduos</CardTitle>
          <CardDescription>
            Materiais aceitos no programa
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

      {/* Marketing Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">📈 Resumo para Marketing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Engagement</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• {stats.totalStudents} alunos engajados</li>
                  <li>• {stats.totalDeliveries} ações sustentáveis</li>
                  <li>• {stats.avgDeliveriesPerStudent.toFixed(1)} entregas por aluno</li>
                  <li>• {courseStats.length} cursos participantes</li>
                </ul>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">Impacto</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• {stats.totalWeight.toFixed(1)} kg de resíduos reciclados</li>
                  <li>• {environmentalImpact.co2Saved} kg CO₂ economizado</li>
                  <li>• {environmentalImpact.treesEquivalent} árvores equivalentes</li>
                  <li>• Inovação em sustentabilidade</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">🎯 Destaques para Comunicação</h4>
              <ul className="text-sm space-y-1 text-blue-700">
                <li>• USCS líder em sustentabilidade universitária</li>
                <li>• Programa gamificado aumenta engajamento estudantil</li>
                <li>• Impacto ambiental mensurável e significativo</li>
                <li>• Integração entre educação e responsabilidade ambiental</li>
                <li>• Modelo replicável para outras instituições</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
