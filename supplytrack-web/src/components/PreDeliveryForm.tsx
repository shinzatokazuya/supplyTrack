import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Plus, Trash2, Package, Clock, AlertCircle } from "lucide-react";
import type { WasteType, WasteItem } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";

interface PreDeliveryFormProps {
  wasteTypes: WasteType[];
  accessToken: string;
  onSuccess: () => void;
}

export function PreDeliveryForm({ wasteTypes, accessToken, onSuccess }: PreDeliveryFormProps) {
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const addWasteItem = () => {
    setWasteItems([...wasteItems, { waste_type_id: "", estimated_weight: 0 }]);
  };

  const removeWasteItem = (index: number) => {
    setWasteItems(wasteItems.filter((_, i) => i !== index));
  };

  const updateWasteItem = (index: number, field: keyof WasteItem, value: string | number) => {
    const updated = [...wasteItems];
    updated[index] = { ...updated[index], [field]: value };
    setWasteItems(updated);
  };

  const getWasteTypeName = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.name || "";
  };

  const getWasteTypeColor = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.color || "#6B7280";
  };

  const calculateExpectedPoints = () => {
    return wasteItems.reduce((total, item) => {
      const wasteType = wasteTypes.find(wt => wt.id === item.waste_type_id);
      return total + (wasteType ? wasteType.points_per_kg * item.estimated_weight : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (wasteItems.length === 0) {
      toast.error('Adicione pelo menos um item de resíduo');
      return;
    }

    const invalidItems = wasteItems.filter(item => !item.waste_type_id || item.estimated_weight <= 0);
    if (invalidItems.length > 0) {
      toast.error('Preencha todos os campos dos itens corretamente');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/pre-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          waste_items: wasteItems,
          notes
        })
      });

      if (response.ok) {
        onSuccess();
        setWasteItems([]);
        setNotes("");
      } else {
        const data = await response.json();
        toast.error('Erro ao criar pré-cadastro: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao criar pré-cadastro:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Pré-cadastro de Entrega
          </CardTitle>
          <CardDescription>
            Registre os resíduos que você pretende levar ao ponto de coleta.
            Isso ajuda a agilizar o processo de validação.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Operating Hours Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-800">Horário de Funcionamento</h3>
              <p className="text-sm text-blue-600">
                Segunda a Sexta: 8:00 às 17:00
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Waste Items */}
        <Card>
          <CardHeader>
            <CardTitle>Itens de Resíduo</CardTitle>
            <CardDescription>
              Adicione os tipos e quantidades estimadas dos resíduos que você irá entregar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wasteItems.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeWasteItem(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Resíduo</Label>
                    <Select
                      value={item.waste_type_id}
                      onValueChange={(value) => updateWasteItem(index, 'waste_type_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map(wt => (
                          <SelectItem key={wt.id} value={wt.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: wt.color }}
                              />
                              {wt.name}
                              <Badge variant="outline" className="ml-2">
                                {wt.points_per_kg} pts/kg
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Peso Estimado (kg)</Label>
                    <Input
                      type="number"
                      placeholder="0.0"
                      step="0.1"
                      min="0.1"
                      value={item.estimated_weight || ""}
                      onChange={(e) => updateWasteItem(index, 'estimated_weight', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {item.waste_type_id && (
                  <div className="p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-600">Pontos estimados: </span>
                    <span className="font-medium text-green-600">
                      {(wasteTypes.find(wt => wt.id === item.waste_type_id)?.points_per_kg || 0) * item.estimated_weight}
                    </span>
                  </div>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addWasteItem}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Observações (Opcional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Adicione qualquer observação sobre os resíduos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        {wasteItems.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Resumo da Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-600">Total de Itens</p>
                    <p className="text-lg font-semibold text-green-800">{wasteItems.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Pontos Estimados</p>
                    <p className="text-lg font-semibold text-green-800">{calculateExpectedPoints()}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-700">Itens cadastrados:</p>
                  {wasteItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                        />
                        {getWasteTypeName(item.waste_type_id)}
                      </span>
                      <span className="text-green-700">{item.estimated_weight} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <h3 className="font-medium text-orange-800">Importante</h3>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Após o pré-cadastro, leve os resíduos ao ponto de coleta</li>
                  <li>• O funcionário irá verificar e validar os itens</li>
                  <li>• Os pontos serão creditados apenas após a validação</li>
                  <li>• Diferenças entre o estimado e real são normais</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={isLoading || wasteItems.length === 0}
        >
          {isLoading ? "Criando pré-cadastro..." : "Criar Pré-cadastro"}
        </Button>
      </form>
    </div>
  );
}
