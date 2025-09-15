import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import { Gift, GraduationCap, CreditCard, Clock, Star, Lock } from "lucide-react";

interface Reward {
  id: string;
  title: string;
  description: string;
  type: "discount" | "hours" | "voucher" | "privilege";
  cost: number;
  value: string;
  available: number;
  icon: React.ReactNode;
  requirements?: string;
}

const rewards: Reward[] = [
  {
    id: "discount-5",
    title: "Desconto 5% Mensalidade",
    description: "Desconto de 5% aplicado na próxima mensalidade",
    type: "discount",
    cost: 500,
    value: "5%",
    available: 50,
    icon: <CreditCard className="w-5 h-5" />,
    requirements: "Mínimo 5 entregas no mês"
  },
  {
    id: "hours-10",
    title: "10 Horas Complementares",
    description: "Certificado de 10 horas de atividade complementar em sustentabilidade",
    type: "hours",
    cost: 300,
    value: "10h",
    available: 100,
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    id: "discount-10",
    title: "Desconto 10% Mensalidade",
    description: "Desconto de 10% aplicado na próxima mensalidade",
    type: "discount",
    cost: 1000,
    value: "10%",
    available: 20,
    icon: <CreditCard className="w-5 h-5" />,
    requirements: "Top 100 do ranking mensal"
  },
  {
    id: "voucher-cantina",
    title: "Voucher Cantina R$ 20",
    description: "Vale de R$ 20 para uso na cantina universitária",
    type: "voucher",
    cost: 200,
    value: "R$ 20",
    available: 75,
    icon: <Gift className="w-5 h-5" />
  },
  {
    id: "hours-20",
    title: "20 Horas Complementares",
    description: "Certificado de 20 horas de atividade complementar em sustentabilidade",
    type: "hours",
    cost: 600,
    value: "20h",
    available: 50,
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    id: "priority-parking",
    title: "Vaga Prioritária Estacionamento",
    description: "Direito a vaga prioritária no estacionamento por 1 mês",
    type: "privilege",
    cost: 800,
    value: "1 mês",
    available: 10,
    icon: <Star className="w-5 h-5" />,
    requirements: "Eco Campeão Badge"
  },
  {
    id: "voucher-livraria",
    title: "Voucher Livraria R$ 50",
    description: "Vale de R$ 50 para uso na livraria universitária",
    type: "voucher",
    cost: 450,
    value: "R$ 50",
    available: 30,
    icon: <Gift className="w-5 h-5" />
  },
  {
    id: "priority-enrollment",
    title: "Prioridade na Matrícula",
    description: "Prioridade na escolha de disciplinas para o próximo semestre",
    type: "privilege",
    cost: 1200,
    value: "1 semestre",
    available: 5,
    icon: <Clock className="w-5 h-5" />,
    requirements: "Top 50 do ranking geral"
  }
];

const userAchievements = ["iniciante-verde", "reciclador", "eco-campeao"];
const userRank = 15;

interface RewardsProps {
  userPoints: number;
  userCollections: number;
}

export function Rewards({ userPoints, userCollections }: RewardsProps) {
  const [redeemedRewards, setRedeemedRewards] = useState<Set<string>>(new Set());

  const canRedeem = (reward: Reward): boolean => {
    if (userPoints < reward.cost) return false;
    if (reward.available <= 0) return false;
    if (redeemedRewards.has(reward.id)) return false;

    // Check specific requirements
    if (reward.requirements) {
      if (reward.requirements.includes("Top 100") && userRank > 100) return false;
      if (reward.requirements.includes("Top 50") && userRank > 50) return false;
      if (reward.requirements.includes("Eco Campeão") && !userAchievements.includes("eco-campeao")) return false;
      if (reward.requirements.includes("5 entregas") && userCollections < 5) return false;
    }

    return true;
  };

  const handleRedeem = (reward: Reward) => {
    if (!canRedeem(reward)) {
      toast.error("Você não atende aos requisitos para esta recompensa");
      return;
    }

    setRedeemedRewards(new Set([...redeemedRewards, reward.id]));
    toast.success(`Recompensa "${reward.title}" resgatada com sucesso!`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "discount": return "bg-green-100 text-green-800";
      case "hours": return "bg-blue-100 text-blue-800";
      case "voucher": return "bg-purple-100 text-purple-800";
      case "privilege": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "discount": return "Desconto";
      case "hours": return "Horas Complementares";
      case "voucher": return "Voucher";
      case "privilege": return "Privilégio";
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seus Pontos Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-green-600">{userPoints}</div>
              <p className="text-sm text-muted-foreground">pontos disponíveis para resgatar</p>
            </div>
            <div className="text-right">
              <div className="text-xl font-medium">{userCollections}</div>
              <p className="text-sm text-muted-foreground">entregas realizadas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canRedeemReward = canRedeem(reward);
          const isRedeemed = redeemedRewards.has(reward.id);

          return (
            <Card key={reward.id} className={`relative ${isRedeemed ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {reward.icon}
                    <Badge className={getTypeColor(reward.type)}>
                      {getTypeName(reward.type)}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">{reward.cost}</div>
                    <div className="text-xs text-muted-foreground">pontos</div>
                  </div>
                </div>
                <CardTitle className="text-lg">{reward.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{reward.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <span>Valor:</span>
                  <span className="font-medium">{reward.value}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Disponível:</span>
                  <span className={reward.available > 0 ? "text-green-600" : "text-red-600"}>
                    {reward.available} unidades
                  </span>
                </div>

                {reward.requirements && (
                  <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                    <strong>Requisito:</strong> {reward.requirements}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Progresso</span>
                    <span>{Math.min(userPoints, reward.cost)}/{reward.cost}</span>
                  </div>
                  <Progress
                    value={(Math.min(userPoints, reward.cost) / reward.cost) * 100}
                    className="h-2"
                  />
                </div>

                <Button
                  onClick={() => handleRedeem(reward)}
                  disabled={!canRedeemReward || isRedeemed}
                  className="w-full"
                  variant={canRedeemReward ? "default" : "secondary"}
                >
                  {isRedeemed ? (
                    "Resgatado"
                  ) : !canRedeemReward ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      {userPoints < reward.cost ? "Pontos Insuficientes" : "Requisitos Não Atendidos"}
                    </>
                  ) : (
                    "Resgatar"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Resgates</CardTitle>
        </CardHeader>
        <CardContent>
          {redeemedRewards.size === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma recompensa resgatada ainda. Continue coletando pontos!
            </p>
          ) : (
            <div className="space-y-2">
              {Array.from(redeemedRewards).map((rewardId) => {
                const reward = rewards.find(r => r.id === rewardId);
                return reward ? (
                  <div key={rewardId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {reward.icon}
                      <span>{reward.title}</span>
                    </div>
                    <Badge variant="secondary">Resgatado</Badge>
                  </div>
                ) : null;
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
