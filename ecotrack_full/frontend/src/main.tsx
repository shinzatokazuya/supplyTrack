import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Entregas from "./pages/Entregas";
import Recompensas from "./pages/Recompensas";
import Leaderboard from "./pages/Leaderboard";
import "./styles.css";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<LoginPage/>} />
      <Route path='/dashboard' element={<Dashboard/>} />
      <Route path='/entregas' element={<Entregas/>} />
      <Route path='/recompensas' element={<Recompensas/>} />
      <Route path='/leaderboard' element={<Leaderboard/>} />
    </Routes>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
