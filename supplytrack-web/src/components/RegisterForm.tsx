import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Recycle, Leaf, ArrowLeft } from "lucide-react";

interface RegisterFormProps {
  onRegister: (userData: {
    email: string;
    password: string;
    name: string;
    ra: string;
    course: string;
    user_type: 'student' | 'staff';
  }) => void;
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onRegister, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    ra: "",
    course: "",
    user_type: "student" as 'student' | 'staff'
  });
  const [isLoading, setIsLoading] = useState(false);

  const courses = [
    "Engenharia da Computação",
    "Sistemas de Informação",
    "Ciência da Computação",
    "Administração",
    "Direito",
    "Psicologia",
    "Arquitetura e Urbanismo",
    "Engenharia Civil",
    "Engenharia de Produção",
    "Marketing",
    "Recursos Humanos",
    "Contabilidade",
    "Educação Física",
    "Fisioterapia",
    "Enfermagem",
    "Nutrição"
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("As senhas não coincidem!");
      return;
    }

    if (formData.password.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...userData } = formData;
    await onRegister(userData);

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-green-600 p-2 rounded-full">
              <Recycle className="h-6 w-6 text-white" />
            </div>
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Criar Conta</CardTitle>
          <CardDescription>
            Junte-se ao movimento sustentável
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Tipo de Usuário</Label>
              <RadioGroup
                value={formData.user_type}
                onValueChange={(value) => handleChange('user_type', value)}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student">Aluno</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="staff" id="staff" />
                  <Label htmlFor="staff">Funcionário</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ra">RA {formData.user_type === 'staff' ? '/ Matrícula' : ''}</Label>
              <Input
                id="ra"
                placeholder={formData.user_type === 'student' ? "Seu RA" : "Sua matrícula"}
                value={formData.ra}
                onChange={(e) => handleChange('ra', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            {formData.user_type === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="course">Curso</Label>
                <Select value={formData.course} onValueChange={(value) => handleChange('course', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.user_type === 'staff' && (
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  placeholder="Seu departamento"
                  value={formData.course}
                  onChange={(e) => handleChange('course', e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onSwitchToLogin}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
