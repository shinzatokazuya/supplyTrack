import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import {
  Clock,
  User,
  Package,
  CheckCircle,
  Edit,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import type { Delivery, WasteType, WasteItem } from "../App";
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface PendingDeliveriesProps {
  accessToken: string;
  wasteTypes: WasteType[];
  onValidationComplete: () => void;
}

export function PendingDeliveries({ accessToken, wasteTypes, onValidationComplete }: PendingDeliveriesProps) {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actualWasteItems, setActualWasteItems] = useState<WasteItem[]>([]);
  const [validationNotes, setValidationNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    loadPendingDeliveries();
  }, []);

  const loadPendingDeliveries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/pending-deliveries`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPendingDeliveries(data.deliveries);
      } else {
        toast.error('Erro ao carregar entregas pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar entregas pendentes:', error);
      toast.error('Erro ao carregar entregas pendentes');
    } finally {
      setLoading(false);
    }
  };

  const getWasteTypeName = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.name || "Desconhecido";
  };

  const getWasteTypeColor = (id: string) => {
    return wasteTypes.find(wt => wt.id === id)?.color || "#6B7280";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateActualPoints = () => {
    return actualWasteItems.reduce((total, item) => {
      const wasteType = wasteTypes.find(wt => wt.id === item.waste_type_id);
      return total + (wasteType ? wasteType.points_per_kg * (item.actual_weight || 0) : 0);
    }, 0);
  };

  const handleSelectDelivery = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    // Initialize actual items based on pre-registered items
    setActualWasteItems(delivery.waste_items.map(item => ({
      waste_type_id: item.waste_type_id,
      estimated_weight: item.estimated_weight,
      actual_weight: item.estimated_weight // Start with estimated weight
    })));
    setValidationNotes("");
  };

  const updateActualItem = (index: number, field: keyof WasteItem, value: string | number) => {
    const updated = [...actualWasteItems];
    updated[index] = { ...updated[index], [field]: value };
    setActualWasteItems(updated);
  };

  const addActualItem = () => {
    setActualWasteItems([...actualWasteItems, { waste_type_id: "", estimated_weight: 0, actual_weight: 0 }]);
  };

  const removeActualItem = (index: number) => {
    setActualWasteItems(actualWasteItems.filter((_, i) => i !== index));
  };

  const handleValidateDelivery = async () => {
    if (!selectedDelivery) return;

    const invalidItems = actualWasteItems.filter(item => !item.waste_type_id || !item.actual_weight || item.actual_weight <= 0);
    if (invalidItems.length > 0) {
      toast.error('Preencha todos os campos dos itens corretamente');
      return;
    }

    setValidating(true);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ec6a43ca/validate-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          delivery_id: selectedDelivery.id,
          actual_waste_items: actualWasteItems,
          notes: validationNotes
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Entrega validada! ${data.points_awarded} pontos creditados ao aluno.`);
        setSelectedDelivery(null);
        loadPendingDeliveries();
        onValidationComplete();
      } else {
        const data = await response.json();
        toast.error('Erro ao validar entrega: ' + data.error);
      }
    } catch (error) {
      console.error('Erro ao validar entrega:', error);
      toast.error('Erro interno do servidor');
    } finally {
      setValidating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando entregas pendentes...</p>
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
                <Clock className="h-5 w-5 text-orange-600" />
                Entregas Pendentes ({pendingDeliveries.length})
              </CardTitle>
              <CardDescription>
                Pré-cadastros aguardando validação dos funcionários
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadPendingDeliveries}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {pendingDeliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhuma entrega pendente</h3>
              <p className="text-sm">
                Todas as entregas foram validadas ou não há pré-cadastros no momento
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingDeliveries.map((delivery) => (
            <Card key={delivery.id} className="border-orange-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        Aguardando Validação
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(delivery.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{delivery.user_info?.name}</span>
                      <span className="text-sm text-gray-600">
                        RA: {delivery.user_info?.ra} • {delivery.user_info?.course}
                      </span>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700"
                        onClick={() => handleSelectDelivery(delivery)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Validar
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      {selectedDelivery && (
                        <>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-orange-600" />
                              Validar Entrega
                            </DialogTitle>
                            <DialogDescription>
                              Confirme e ajuste os itens entregues pelo aluno
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            {/* Student Info */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h3 className="font-medium mb-2">Informações do Aluno</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Nome:</span>
                                  <p className="font-medium">{selectedDelivery.user_info?.name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">RA:</span>
                                  <p className="font-medium">{selectedDelivery.user_info?.ra}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Curso:</span>
                                  <p className="font-medium">{selectedDelivery.user_info?.course}</p>
                                </div>
                                <div>
                                  <span className="text-gray-600">Pré-cadastro:</span>
                                  <p className="font-medium">{formatDate(selectedDelivery.created_at)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Pre-registered vs Actual */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Pre-registered Items */}
                              <div>
                                <h3 className="font-medium mb-3 text-orange-700">Itens Pré-cadastrados</h3>
                                <div className="space-y-3">
                                  {selectedDelivery.waste_items.map((item, index) => (
                                    <div key={index} className="p-3 bg-orange-50 rounded border border-orange-200">
                                      <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2">
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                                          />
                                          {getWasteTypeName(item.waste_type_id)}
                                        </span>
                                        <span className="font-medium">{item.estimated_weight} kg</span>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="p-2 bg-orange-100 rounded text-sm">
                                    <strong>Pontos estimados: {selectedDelivery.expected_points}</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Actual Items */}
                              <div>
                                <h3 className="font-medium mb-3 text-green-700">Itens Reais Entregues</h3>
                                <div className="space-y-3">
                                  {actualWasteItems.map((item, index) => (
                                    <div key={index} className="p-3 border rounded">
                                      <div className="grid grid-cols-1 gap-3">
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-2 flex-1">
                                            <Label>Tipo de Resíduo</Label>
                                            <Select
                                              value={item.waste_type_id}
                                              onValueChange={(value) => updateActualItem(index, 'waste_type_id', value)}
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

                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeActualItem(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        <div className="space-y-2">
                                          <Label>Peso Real (kg)</Label>
                                          <Input
                                            type="number"
                                            placeholder="0.0"
                                            step="0.1"
                                            min="0.1"
                                            value={item.actual_weight || ""}
                                            onChange={(e) => updateActualItem(index, 'actual_weight', parseFloat(e.target.value) || 0)}
                                          />
                                        </div>

                                        {item.waste_type_id && item.actual_weight && (
                                          <div className="p-2 bg-green-50 rounded text-sm">
                                            <span className="text-green-600">Pontos: </span>
                                            <span className="font-medium text-green-700">
                                              {(wasteTypes.find(wt => wt.id === item.waste_type_id)?.points_per_kg || 0) * item.actual_weight}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addActualItem}
                                    className="w-full"
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Adicionar Item
                                  </Button>

                                  {actualWasteItems.length > 0 && (
                                    <div className="p-3 bg-green-100 rounded">
                                      <strong className="text-green-700">
                                        Total de pontos: {calculateActualPoints()}
                                      </strong>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-3">
                              {selectedDelivery.notes && (
                                <div>
                                  <Label className="text-sm font-medium text-gray-600">Observações do aluno</Label>
                                  <div className="p-3 bg-gray-50 rounded text-sm mt-1">
                                    {selectedDelivery.notes}
                                  </div>
                                </div>
                              )}

                              <div>
                                <Label htmlFor="validation_notes">Observações da Validação (Opcional)</Label>
                                <Textarea
                                  id="validation_notes"
                                  placeholder="Adicione observações sobre a validação..."
                                  value={validationNotes}
                                  onChange={(e) => setValidationNotes(e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedDelivery(null)}>
                              Cancelar
                            </Button>
                            <Button
                              onClick={handleValidateDelivery}
                              disabled={validating || actualWasteItems.length === 0}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {validating ? "Validando..." : `Validar e Creditar ${calculateActualPoints()} Pontos`}
                            </Button>
                          </DialogFooter>
                        </>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator className="my-3" />

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Itens pré-cadastrados:</h4>
                  {delivery.waste_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: getWasteTypeColor(item.waste_type_id) }}
                        />
                        {getWasteTypeName(item.waste_type_id)}
                      </span>
                      <span className="text-gray-600">{item.estimated_weight} kg</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t text-sm">
                    <span className="text-gray-600">Pontos estimados: </span>
                    <span className="font-medium text-orange-600">{delivery.expected_points}</span>
                  </div>
                </div>

                {delivery.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded border">
                    <p className="text-xs text-gray-500 mb-1">Observações do aluno:</p>
                    <p className="text-sm">{delivery.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
