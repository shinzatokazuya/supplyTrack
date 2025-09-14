import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Calendar, TrendingUp, Users, Package, Award } from "lucide-react";

const monthlyData = [
  { month: "Jan", collections: 45, weight: 89.5, points: 1250 },
  { month: "Fev", collections: 52, weight: 104.2, points: 1480 },
  { month: "Mar", collections: 48, weight: 95.8, points: 1380 },
  { month: "Abr", collections: 61, weight: 122.3, points: 1720 },
  { month: "Mai", collections: 58, weight: 115.7, points: 1650 },
  { month: "Jun", collections: 65, weight: 130.2, points: 1850 },
  { month: "Jul", collections: 72, weight: 144.8, points: 2050 },
  { month: "Ago", collections: 68, weight: 136.4, points: 1920 },
  { month: "Set", collections: 75, weight: 150.3, points: 2150 }
];

const wasteTypeData = [
  { name: "Plástico", value: 35, color: "#3B82F6" },
  { name: "Papel", value: 28, color: "#10B981" },
  { name: "Metal", value: 15, color: "#6B7280" },
  { name: "Vidro", value: 12, color: "#8B5CF6" },
  { name: "Eletrônico", value: 8, color: "#EF4444" },
  { name: "Orgânico", value: 2, color: "#F59E0B" }
];

const topStudents = [
  { name: "Ana Silva", ra: "2021001234", course: "Engenharia Ambiental", points: 1250, collections: 45 },
  { name: "João Santos", ra: "2020005678", course: "Administração", points: 1180, collections: 38 },
  { name: "Maria Costa", ra: "2021009876", course: "Ciências Biológicas", points: 950, collections: 42 },
  { name: "Pedro Lima", ra: "2019003456", course: "Engenharia Civil", points: 870, collections: 35 },
  { name: "Julia Rocha", ra: "2022004567", course: "Marketing", points: 820, collections: 28 }
];

const topCourses = [
  { name: "Engenharia Ambiental", students: 12, points: 5420, percentage: 85 },
  { name: "Ciências Biológicas", students: 15, points: 4380, percentage: 72 },
  { name: "Administração", students: 18, points: 3950, percentage: 68 },
  { name: "Engenharia Civil", students: 10, points: 3650, percentage: 64 }
];

export function Reports() {
  const handleExportData = (type: string) => {
    // Mock export functionality
    const data = {
      monthly: monthlyData,
      students: topStudents,
      courses: topCourses,
      wasteTypes: wasteTypeData
    };

    const exportData = data[type as keyof typeof data];
    const csv = convertToCSV(exportData);
    downloadCSV(csv, `eco-uscs-${type}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    return [headers, ...rows].join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatórios e Estatísticas</h2>
          <p className="text-muted-foreground">
            Análise completa do programa de coleta sustentável
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select defaultValue="current-month">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="current-semester">Semestre Atual</SelectItem>
              <SelectItem value="current-year">Ano Atual</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Período Customizado
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entregas</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">542</div>
            <p className="text-xs text-muted-foreground">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resíduos Coletados</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,087kg</div>
            <p className="text-xs text-muted-foreground">+8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Participantes</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pontos Distribuídos</CardTitle>
            <Award className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,420</div>
            <p className="text-xs text-muted-foreground">+18% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evolução Mensal</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportData('monthly')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="collections" fill="#3B82F6" name="Entregas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Waste Type Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Distribuição por Tipo de Resíduo</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportData('wasteTypes')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {wasteTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weight Collection Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evolução do Peso Coletado (kg)</CardTitle>
          <Button variant="outline" size="sm" onClick={() => handleExportData('monthly')}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2} name="Peso (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top 5 Alunos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportData('students')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topStudents.map((student, index) => (
                <div key={student.ra} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.course}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{student.points} pts</div>
                    <div className="text-sm text-muted-foreground">{student.collections} entregas</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ranking por Curso</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleExportData('courses')}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">#{index + 1}</span>
                        <span className="text-sm">{course.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {course.students} estudantes • {course.points} pontos
                      </div>
                    </div>
                    <Badge variant="secondary">{course.percentage}%</Badge>
                  </div>
                  <Progress value={course.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Impacto Ambiental</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">543</div>
              <div className="text-sm text-muted-foreground">Árvores salvas</div>
              <div className="text-xs text-muted-foreground mt-1">
                Baseado na reciclagem de papel
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,304</div>
              <div className="text-sm text-muted-foreground">Litros de água economizados</div>
              <div className="text-xs text-muted-foreground mt-1">
                Economia no processo produtivo
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">2,282</div>
              <div className="text-sm text-muted-foreground">kg CO₂ não emitidos</div>
              <div className="text-xs text-muted-foreground mt-1">
                Redução da pegada de carbono
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">95</div>
              <div className="text-sm text-muted-foreground">kWh de energia economizada</div>
              <div className="text-xs text-muted-foreground mt-1">
                Energia poupada na produção
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
