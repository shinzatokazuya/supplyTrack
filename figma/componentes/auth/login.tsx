import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { toast } from "sonner@2.0.3";
import { Leaf, User, UserCheck } from "lucide-react";

interface LoginProps {
    onLogin: (user: any) => void;
}

export function Login( { onLogin }: LoginProps) {
    const [dadosLogin, setDadosLogin] = useState({
        ra: "",
        senha: ""
    });

    const [dadosCadastro, setDadosCadastro] = useState({
        nome: "",
        email: "",
        ra: "",
        curso: "",
        semestre: "",
        senha: "",
        confirmarSenha: "",
        tipoUsuario: "estudante"
    });

    const cursos = [
        "Administração",
        "Análise e Desenvolvimento de Sistemas",
        "Arquitetura e Urbanismo",
        "Banco de Dados",
        "Biomedicina",
        "Ciências Biológicas",
        "Ciência da Computação",
        "Segurança Cibernética",
        "Ciências Contábeis",
        "Ciências Contábeis para Graduados",
        "Ciências Econômicas",
        "Comércio Exterior",
        "Design de Interiores",
        "Design Gráfico",
        "Direito",
        "Educação Física",
        "Enfermagem",
        "Engenharia Civil",
        "Engenharia da Computação",
        "Engenharia de Controle e Automação (Mecatrônica)",
        "Engenharia de Produção",
        "Engenharia Elétrica",
        "Engenharia Química",
        "Estatística",
        "Estética e Cosmética",
        "Farmácia",
        "Fisioterapia",
        "Fonoaudiologia",
        "Inteligência Artificial",
        "Gestão Comercial",
        "Gestão da Qualidade",
        "Gestão de Negócios Imobiliários",
        "Gestão de RH",
        "Gestão Financeira",
        "Gestão Hospitalar",
        "Gestão de TI",
        "Logística",
        "Jogos Digitais",
        "Jornalismo",
        "Marketing",
        "Medicina",
        "Medicina Veterinária",
        "Mídias Sociais Digitais",
        "Musicoterapia",
        "Nutrição",
        "Odontologia",
        "Pedagogia",
        "Processos Gerenciais",
        "Produção Audiovisual (Cinema e Vídeo)",
        "Produção Cultural",
        "Psicologia",
        "Publicidade e Propaganda",
        "Relações Internacionais",
        "Secretariado",
        "Terapia Ocupacional",
        "Teologia"
    ];

    const lidandoComOLogin = () => {
        if (!dadosLogin.ra || !dadosLogin.senha) {
            toast.error("Preencha todos os campos.");
            return;
        }

        // Autenticacao Mock
        const usuariosMock = {
            ID: "",
            nome: "",
            email: "",
            ra: "",
            curso: "",
            semestre: "",
            tipoUsuario: "",
            dataEntrada: ""
        }
    };

    const lidandoComOCadastro = () => {
        if(!dadosCadastro.nome || !dadosCadastro.email || !dadosCadastro.ra || !dadosCadastro.senha) {
            toast.error("Preencha todos os campos obrigatórios.");
            return;
        }

        if (dadosCadastro.senha !== dadosCadastro.confirmarSenha) {
            toast.error("Senhas não conferem.");
            return;
        }

        if (dadosCadastro.tipoUsuario === "estudante" && (!dadosCadastro.curso || !dadosCadastro.semestre)) {
            toast.error("Curso e semestre são obrigatórios para alunos");
            return;
        }
    }
}
