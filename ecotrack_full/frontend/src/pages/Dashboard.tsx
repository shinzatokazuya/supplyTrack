import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/api";

export default function Dashboard() {
  const [me, setMe] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/usuarios/me");
        setMe(res);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Pontos: {me?.pontos ?? 0}</div>
        <div className="bg-white p-4 rounded shadow">Entregas: {/* número */}</div>
        <div className="bg-white p-4 rounded shadow">Medalhas: {/* número */}</div>
      </div>
    </div>
  );
}
