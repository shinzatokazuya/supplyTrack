import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Entregas() {
  const [entregas, setEntregas] = useState<any[]>([]);

  useEffect(()=>{
    async function load(){ 
      try{ const res = await apiFetch("/api/entregas"); setEntregas(res); } catch(err){ console.error(err); }
    }
    load();
  },[]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Minhas Entregas</h1>
      <div className="space-y-3">
        {entregas.map(e => (
          <div key={e.id} className="bg-white p-3 rounded shadow">
            <div>Status: {e.status}</div>
            <div>Pontos recebidos: {e.pontosRecebidos ?? '-'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
