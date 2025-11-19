import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Leaderboard() {
  const [top, setTop] = useState<any[]>([]);

  useEffect(()=>{
    async function load(){ 
      try{ const res = await apiFetch("/api/leaderboard"); setTop(res); } catch(err){ console.error(err); }
    }
    load();
  },[]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Leaderboard</h1>
      <ol className="space-y-2">
        {top.map(t => (
          <li key={t.usuarioId} className="bg-white p-3 rounded shadow flex justify-between">
            <div>{t.usuario.nome}</div>
            <div>{t.pontosAcumulados} pts</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
