import React, { useState } from "react";
import { apiFetch } from "../api/api";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, senha })
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.message || "Erro no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Entrar</h2>
        <label className="block text-sm">E-mail</label>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 border rounded mb-3" required/>
        <label className="block text-sm">Senha</label>
        <input type="password" value={senha} onChange={(e)=>setSenha(e.target.value)} className="w-full p-2 border rounded mb-4" required/>
        <button className="w-full py-2 bg-green-600 text-white rounded" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
    </div>
  );
}
