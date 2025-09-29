import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { QrCode, Search, CheckCircle, X, Camera, User } from "lucide-react";

const wasteTypes = [
  { id: "plastic", name: "Plástico", points: 10, color: "blue" },
  { id: "paper", name: "Papel", points: 8, color: "green" },
  { id: "metal", name: "Metal", points: 15, color: "gray" },
  { id: "glass", name: "Vidro", points: 12, color: "purple" },
  { id: "electronic", name: "Eletrônico", points: 25, color: "red" },
  { id: "organic", name: "Orgânico", points: 5, color: "yellow" },
];

const mockStudents = [
  { ra: "2021001234", name: "Ana Silva", course: "Engenharia Ambiental" },
  { ra: "2020005678", name: "João Santos", course: "Administração" },
  { ra: "2021009876", name: "Maria Costa", course: "Ciências Biológicas" },
  { ra: "2019003456", name: "Pedro Lima", course: "Engenharia Civil" },
];

const pendingDeliveries = [
  {
    id: "QR001234567",
    studentRA: "2021001234",
    studentName: "Ana Silva",
    course: "Engenharia Ambiental",
    timestamp: "2024-09-14 10:30",
    items: [
      { type: "plastic", description: "Garrafas PET", estimatedWeight: 2.5 }
    ]
  },
  {
    id: "QR001234568",
    studentRA: "2019003456",
    studentName: "Pedro Lima",
    course: "Engenharia Civil",
    timestamp: "2024-09-14 09:30",
    items: [
      { type: "electronic", description: "Celular antigo", estimatedWeight: 3.0 }
    ]
  }
];

interface ValidateDeliveryProps {
  onValidation: (deliveryData: any) => void;
}

export function ValidateDelivery({ onValidation }: ValidateDeliveryProps) {
  const [searchMethod, setSearchMethod] = useState<"qr" | "ra">("qr");
  const [searchValue, setSearchValue] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [validationData, setValidationData] = useState({
    wasteType: "",
    weight: "",
    points: 0,
    notes: ""
  });

  const handleSearch = () => {
    if (searchMethod === "qr") {
      // Mock QR code scan
      const delivery = pendingDeliveries.find(d => d.id === searchValue);
      if (delivery) {
        setSelectedDelivery(delivery);
        toast.success("Entrega encontrada!");
      } else {
        toast.error("QR Code não encontrado");
      }
    } else {
      // Search by RA
      const student = mockStudents.find(s => s.ra === searchValue);
      if (student) {
        const delivery = pendingDeliveries.find(d => d.studentRA === searchValue);
        if (delivery) {
          setSelectedDelivery(delivery);
          toast.success("Entrega encontrada!");
        } else {
          toast.error("Nenhuma entrega pendente para este aluno");
        }
      } else {
        toast.error("Aluno não encontrado");
      }
    }
  };

  const handleWasteTypeChange = (type: string) => {
    const wasteType = wasteTypes.find(w => w.id === type);
    const weight = parseFloat(validationData.weight) || 0;
    const points = wasteType ? wasteType.points * weight : 0;

    setValidationData({
      ...validationData,
      wasteType: type,
      points: points
    });
  };

  const handleWeightChange = (weight: string) => {
    const wasteType = wasteTypes.find(w => w.id === validationData.wasteType);
    const weightNum = parseFloat(weight) || 0;
    const points = wasteType ? wasteType.points * weightNum : 0;

    setValidationData({
      ...validationData,
      weight: weight,
      points: points
    });
  };

  const handleValidate = () => {
    if (!selectedDelivery) {
      toast.error("Selecione uma entrega para validar");
      return;
    }

    if (!validationData.wasteType || !validationData.weight) {
      toast.error("Preencha o tipo de resíduo e o peso");
      return;
    }

    const deliveryData = {
      ...selectedDelivery,
      actualWeight: parseFloat(validationData.weight),
      wasteType: validationData.wasteType,
      points: validationData.points,
      notes: validationData.notes,
      validatedAt: new Date().toISOString(),
      status: "validated"
    };

    onValidation(deliveryData);
    toast.success("Entrega validada com sucesso!");

    // Reset form
    setSelectedDelivery(null);
    setSearchValue("");
    setValidationData({
      wasteType: "",
      weight: "",
      points: 0,
      notes: ""
    });
  };

  const handleReject = () => {
    if (!selectedDelivery) return;

    const rejectionData = {
      ...selectedDelivery,
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectionReason: validationData.notes
    };

    onValidation(rejectionData);
    toast.error("Entrega rejeitada");

    // Reset form
    setSelectedDelivery(null);
    setSearchValue("");
    setValidationData({
      wasteType: "",
      weight: "",
      points: 0,
      notes: ""
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Validar Entregas</h2>
        <p className="text-muted-foreground">
          Encontre e valide entregas de resíduos dos alunos
        </p>
      </div>

      {/* Search Method */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchMethod === "qr" ? "default" : "outline"}
              onClick={() => setSearchMethod("qr")}
              className="flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              QR Code
            </Button>
            <Button
              variant={searchMethod === "ra" ? "default" : "outline"}
              onClick={() => setSearchMethod("ra")}
              className="flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Buscar por RA
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={searchMethod === "qr" ? "Escaneie ou digite o QR Code" : "Digite o RA do aluno"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4" />
            </Button>
            {searchMethod === "qr" && (
              <Button variant="outline">
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {searchMethod === "qr" ? (
              <p>QR Codes de teste: QR001234567, QR001234568</p>
            ) : (
              <p>RAs de teste: 2021001234, 2019003456</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Entregas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pendingDeliveries.map((delivery) => (
              <div
                key={delivery.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDelivery?.id === delivery.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedDelivery(delivery)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{delivery.studentName}</span>
                      <Badge variant="outline">{delivery.studentRA}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{delivery.course}</p>
                    <p className="text-sm text-muted-foreground">{delivery.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">Pendente</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {delivery.items.map(item => item.description).join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Form */}
      {selectedDelivery && (
        <Card>
          <CardHeader>
            <CardTitle>Validar Entrega - {selectedDelivery.studentName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="waste-type">Tipo de Resíduo</Label>
                <Select value={validationData.wasteType} onValueChange={handleWasteTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {wasteTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name} - {type.points} pts/kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="weight">Peso Real (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={validationData.weight}
                  onChange={(e) => handleWeightChange(e.target.value)}
                />
              </div>
            </div>

            {validationData.points > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Pontos a serem creditados:</span>
                  <span className="font-bold text-green-600">+{validationData.points} pontos</span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Adicione observações sobre a entrega..."
                value={validationData.notes}
                onChange={(e) => setValidationData({...validationData, notes: e.target.value})}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleValidate}
                className="flex-1"
                disabled={!validationData.wasteType || !validationData.weight}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Validar Entrega
              </Button>
              <Button
                onClick={handleReject}
                variant="destructive"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Rejeitar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
