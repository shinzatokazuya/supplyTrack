import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { QrCode, Download, Share2, Clock, CheckCircle } from "lucide-react";

interface QRDelivery {
  id: string;
  qrCode: string;
  timestamp: string;
  status: "pending" | "validated" | "expired";
  expiresAt: string;
}

interface QRCodeGeneratorProps {
  studentRA: string;
  studentName: string;
}

export function QRCodeGenerator({ studentRA, studentName }: QRCodeGeneratorProps) {
  const [currentQR, setCurrentQR] = useState<QRDelivery | null>(null);
  const [qrHistory, setQrHistory] = useState<QRDelivery[]>([
    {
      id: "QR001234565",
      qrCode: "QR001234565",
      timestamp: "2024-09-13 14:30",
      status: "validated",
      expiresAt: "2024-09-13 16:30"
    },
    {
      id: "QR001234566",
      qrCode: "QR001234566",
      timestamp: "2024-09-12 10:15",
      status: "validated",
      expiresAt: "2024-09-12 12:15"
    }
  ]);

  const generateQRCode = () => {
    // Check if there's already an active QR
    if (currentQR && currentQR.status === "pending") {
      toast.error("Você já possui um QR Code ativo. Use-o antes de gerar um novo.");
      return;
    }

    const qrId = `QR${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

    const newQR: QRDelivery = {
      id: qrId,
      qrCode: qrId,
      timestamp: now.toLocaleString('pt-BR'),
      status: "pending",
      expiresAt: expiresAt.toLocaleString('pt-BR')
    };

    setCurrentQR(newQR);
    toast.success("QR Code gerado com sucesso!");
  };

  const downloadQR = () => {
    if (!currentQR) return;

    // Create a simple text file with QR code info
    const qrData = `Ecotrack - QR Code de Entrega

Aluno: ${studentName}
RA: ${studentRA}
Código: ${currentQR.qrCode}
Gerado em: ${currentQR.timestamp}
Expira em: ${currentQR.expiresAt}

Apresente este código ao funcionário responsável pela coleta.`;

    const blob = new Blob([qrData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-code-${currentQR.qrCode}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("QR Code baixado!");
  };

  const shareQR = async () => {
    if (!currentQR) return;

    const shareData = {
      title: 'Ecotrack - QR Code de Entrega',
      text: `QR Code: ${currentQR.qrCode}\nAluno: ${studentName}\nExpira em: ${currentQR.expiresAt}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success("QR Code compartilhado!");
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      toast.success("QR Code copiado para área de transferência!");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "validated": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "validated": return "Validado";
      case "expired": return "Expirado";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">QR Code para Entrega</h2>
        <p className="text-muted-foreground">
          Gere um QR Code para registrar sua entrega de resíduos
        </p>
      </div>

      {/* Generate QR Code */}
      <Card>
        <CardHeader>
          <CardTitle>Gerar Novo QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            {!currentQR || currentQR.status !== "pending" ? (
              <div>
                <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
                <Button onClick={generateQRCode} className="w-full">
                  Gerar QR Code
                </Button>
                <p className="text-sm text-muted-foreground">
                  O QR Code é válido por 2 horas após a geração
                </p>
              </div>
            ) : (
              <div>
                <div className="w-48 h-48 bg-white border-2 border-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <QrCode className="w-16 h-16 mx-auto mb-2" />
                    <div className="font-mono text-sm break-all px-2">{currentQR.qrCode}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge className={getStatusColor(currentQR.status)} variant="secondary">
                    {getStatusText(currentQR.status)}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Gerado em: {currentQR.timestamp}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expira em: {currentQR.expiresAt}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadQR} variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                  <Button onClick={shareQR} variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Como usar o QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-medium">Gere o QR Code</h4>
                <p className="text-sm text-muted-foreground">Clique no botão para gerar um novo código</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-medium">Separe os resíduos</h4>
                <p className="text-sm text-muted-foreground">Organize seus resíduos por tipo antes de ir ao ponto de coleta</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-medium">Apresente ao funcionário</h4>
                <p className="text-sm text-muted-foreground">Mostre o QR Code para o funcionário responsável pela validação</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h4 className="font-medium">Receba os pontos</h4>
                <p className="text-sm text-muted-foreground">Após a validação, os pontos serão creditados automaticamente</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qrHistory.map((qr) => (
              <div key={qr.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{qr.qrCode}</span>
                    <Badge className={getStatusColor(qr.status)} variant="secondary">
                      {getStatusText(qr.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gerado em: {qr.timestamp}
                  </p>
                </div>
                <div className="flex items-center">
                  {qr.status === "validated" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : qr.status === "pending" ? (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
