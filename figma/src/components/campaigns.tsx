import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Calendar, Users, Target, Leaf, Recycle, TreePine } from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  target: number;
  current: number;
  participants: number;
  status: "active" | "upcoming" | "completed";
  type: "challenge" | "education" | "event";
  image?: string;
  rewards?: string[];
}

const campaigns: Campaign[] = [
  {
    id: "setembro-verde",
    title: "Setembro Verde - Meta 2024",
    description: "Campanha para arrecadar 500kg de resíduos recicláveis durante o mês de setembro e conscientizar sobre sustentabilidade.",
    startDate: "2024-09-01",
    endDate: "2024-09-30",
    target: 500,
    current: 387,
    participants: 156,
    status: "active",
    type: "challenge",
    rewards: ["Badge exclusivo", "Certificado participação", "Pontos dobrados"]
  },
  {
    id: "semana-consciencia",
    title: "Semana da Consciência Ambiental",
    description: "Palestras, workshops e atividades educativas sobre sustentabilidade e preservação ambiental.",
    startDate: "2024-10-15",
    endDate: "2024-10-19",
    target: 200,
    current: 0,
    participants: 45,
    status: "upcoming",
    type: "education"
  },
  {
    id: "recicla-tech",
    title: "Recicla Tech",
    description: "Campanha específica para coleta de equipamentos eletrônicos obsoletos ou danificados.",
    startDate: "2024-08-01",
    endDate: "2024-08-31",
    target: 100,
    current: 100,
    participants: 89,
    status: "completed",
    type: "challenge",
    rewards: ["20 horas complementares", "Desconto 15% mensalidade"]
  },
  {
    id: "dia-arvore",
    title: "Dia da Árvore - Plantio Coletivo",
    description: "Ação de plantio de mudas no campus da USCS em comemoração ao Dia da Árvore.",
    startDate: "2024-09-21",
    endDate: "2024-09-21",
    target: 50,
    current: 67,
    participants: 67,
    status: "completed",
    type: "event"
  },
  {
    id: "outubro-rosa-verde",
    title: "Outubro Rosa e Verde",
    description: "Campanha que une conscientização sobre câncer de mama e sustentabilidade ambiental.",
    startDate: "2024-10-01",
    endDate: "2024-10-31",
    target: 300,
    current: 0,
    participants: 23,
    status: "upcoming",
    type: "challenge",
    rewards: ["Badge especial", "Desconto parceria clínicas"]
  }
];

const educationalContent = [
  {
    title: "Como separar corretamente os resíduos",
    description: "Guia completo sobre separação e destinação adequada de diferentes tipos de resíduos.",
    icon: <Recycle className="w-6 h-6 text-blue-600" />,
    link: "#"
  },
  {
    title: "Impacto ambiental dos resíduos eletrônicos",
    description: "Entenda os riscos e aprenda a descartar equipamentos eletrônicos de forma responsável.",
    icon: <Leaf className="w-6 h-6 text-green-600" />,
    link: "#"
  },
  {
    title: "Sustentabilidade no dia a dia",
    description: "Dicas práticas para adotar hábitos mais sustentáveis na universidade e em casa.",
    icon: <TreePine className="w-6 h-6 text-green-700" />,
    link: "#"
  }
];

export function Campaigns() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "upcoming": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativa";
      case "upcoming": return "Em Breve";
      case "completed": return "Concluída";
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "challenge": return <Target className="w-5 h-5" />;
      case "education": return <Leaf className="w-5 h-5" />;
      case "event": return <Calendar className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Campanhas Sustentáveis</h2>
        <p className="text-muted-foreground">
          Participe das campanhas de conscientização ambiental e ganhe pontos extras!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(campaign.type)}
                  <CardTitle className="text-lg">{campaign.title}</CardTitle>
                </div>
                <Badge className={getStatusColor(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {campaign.image && (
                <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-sm text-muted-foreground">{campaign.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Período</div>
                    <div className="text-muted-foreground">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Participantes</div>
                    <div className="text-muted-foreground">{campaign.participants} pessoas</div>
                  </div>
                </div>
              </div>

              {campaign.type === "challenge" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Meta</span>
                    <span>{campaign.current}/{campaign.target}kg</span>
                  </div>
                  <Progress
                    value={(campaign.current / campaign.target) * 100}
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {Math.round((campaign.current / campaign.target) * 100)}% da meta atingida
                  </div>
                </div>
              )}

              {campaign.rewards && campaign.rewards.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-2">Recompensas:</div>
                  <div className="flex flex-wrap gap-1">
                    {campaign.rewards.map((reward, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {reward}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                variant={campaign.status === "active" ? "default" : "secondary"}
                disabled={campaign.status === "completed"}
              >
                {campaign.status === "active" && "Participar"}
                {campaign.status === "upcoming" && "Inscrever-se"}
                {campaign.status === "completed" && "Campanha Concluída"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Conteúdo Educativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {educationalContent.map((content, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  {content.icon}
                  <h4 className="font-medium">{content.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{content.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <div className="font-medium">Workshop: Compostagem Doméstica</div>
                <div className="text-sm text-muted-foreground">25 de Setembro, 14h - Auditório Principal</div>
              </div>
              <Button size="sm" variant="outline">Ver Detalhes</Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium">Palestra: Economia Circular</div>
                <div className="text-sm text-muted-foreground">30 de Setembro, 19h - Sala de Conferências</div>
              </div>
              <Button size="sm" variant="outline">Ver Detalhes</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
