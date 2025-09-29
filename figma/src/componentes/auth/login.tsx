import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner";
import { Leaf, User, UserCheck } from "lucide-react";

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [loginData, setLoginData] = useState({
    ra: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    ra: "",
    course: "",
    semester: "",
    password: "",
    confirmPassword: "",
    userType: "student"
  });

  const courses = [
    "Administração",
    "Ciências Biológicas",
    "Direito",
    "Educação Física",
    "Engenharia Ambiental",
    "Engenharia Civil",
    "Engenharia de Produção",
    "Marketing",
    "Nutrição",
    "Psicologia",
    "Sistemas de Informação"
  ];

  const handleLogin = () => {
    if (!loginData.ra || !loginData.password) {
      toast.error("Preencha todos os campos");
      return;
    }

    // Mock authentication - in real app, this would call an API
    const mockUsers = {
      "2021001234": {
        id: "1",
        name: "Ana Silva",
        email: "ana.silva@aluno.uscs.edu.br",
        ra: "2021001234",
        course: "Engenharia Ambiental",
        semester: 6,
        userType: "student",
        joinDate: "2024-03-15"
      },
      "FUNC001": {
        id: "2",
        name: "Carlos Santos",
        email: "carlos.santos@uscs.edu.br",
        ra: "FUNC001",
        department: "Sustentabilidade",
        userType: "employee",
        joinDate: "2020-01-15"
      }
    };

    const user = mockUsers[loginData.ra as keyof typeof mockUsers];

    if (user && loginData.password === "123456") {
      toast.success("Login realizado com sucesso!");
      onLogin(user);
    } else {
      toast.error("RA ou senha inválidos");
    }
  };

  const handleRegister = () => {
    if (!registerData.name || !registerData.email || !registerData.ra || !registerData.password) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Senhas não conferem");
      return;
    }

    if (registerData.userType === "student" && (!registerData.course || !registerData.semester)) {
      toast.error("Curso e semestre são obrigatórios para alunos");
      return;
    }

    // Mock registration
    const newUser = {
      id: Date.now().toString(),
      name: registerData.name,
      email: registerData.email,
      ra: registerData.ra,
      course: registerData.course,
      semester: parseInt(registerData.semester),
      userType: registerData.userType,
      joinDate: new Date().toISOString().split('T')[0]
    };

    toast.success("Cadastro realizado com sucesso!");
    onLogin(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-green-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Ecotrack</h1>
          <p className="text-gray-600">Sistema de Coleta Sustentável</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Acesse sua conta</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ra">RA ou Matrícula</Label>
                  <Input
                    id="ra"
                    placeholder="Digite seu RA"
                    value={loginData.ra}
                    onChange={(e) => setLoginData({...loginData, ra: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  />
                </div>

                <Button onClick={handleLogin} className="w-full">
                  Entrar
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Contas de teste:</p>
                  <p>Aluno: RA 2021001234, Senha: 123456</p>
                  <p>Funcionário: RA FUNC001, Senha: 123456</p>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userType">Tipo de Usuário</Label>
                  <Select value={registerData.userType} onValueChange={(value) =>
                    setRegisterData({...registerData, userType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Aluno
                        </div>
                      </SelectItem>
                      <SelectItem value="employee">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4" />
                          Funcionário
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Digite seu nome"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@uscs.edu.br"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ra-register">RA ou Matrícula</Label>
                  <Input
                    id="ra-register"
                    placeholder={registerData.userType === "student" ? "Seu RA" : "Sua matrícula"}
                    value={registerData.ra}
                    onChange={(e) => setRegisterData({...registerData, ra: e.target.value})}
                  />
                </div>

                {registerData.userType === "student" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="course">Curso</Label>
                      <Select value={registerData.course} onValueChange={(value) =>
                        setRegisterData({...registerData, course: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione seu curso" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course} value={course}>
                              {course}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester">Semestre</Label>
                      <Select value={registerData.semester} onValueChange={(value) =>
                        setRegisterData({...registerData, semester: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o semestre" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9,10].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              {sem}º Semestre
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password-register">Senha</Label>
                  <Input
                    id="password-register"
                    type="password"
                    placeholder="Digite sua senha"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                  />
                </div>

                <Button onClick={handleRegister} className="w-full">
                  Cadastrar
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
