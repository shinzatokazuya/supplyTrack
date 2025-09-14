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
    const [loginData, setLoginData] = useState({
        ra: "",
        senha: ""
    });

    const [registerData, setRegisterData] = useState({
        nome: "";
        email: "";
        ra: "";
        
    })
}
