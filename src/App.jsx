import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// IMPORTACIÓN DE PÁGINAS
import Inicio from "./pages/Inicio";
import Gestion from "./pages/gestion/Gestion";
import BuscarJugador from "./pages/gestion/BuscarJugador"; 
import FichaJugador from "./pages/gestion/FichaJugador";   
import Asistencias from "./pages/gestion/Asistencias";
import Convocatorias from "./pages/gestion/Convocatorias";
import PlanillaAsistencias from "./pages/gestion/PlanillaAsistencias";
import Subcomision from "./pages/subcomision/Subcomision";
import Cobranzas from "./pages/cobranzas/Cobranzas";
import VentaMedias from "./pages/subcomision/VentaMedias";
import Planificacion from "./pages/gestion/Planificacion"; 
import NuevoPartido from "./pages/gestion/NuevoPartido";
import Tracker from "./pages/gestion/Tracker";
import Historial from "./pages/gestion/Historial";
import Acceso from "./pages/Acceso"; 

// --- MÓDULO JORNADA ---
import MenuJornada from "./pages/subcomision/Jornada/MenuJornada";
import ConfigPrecios from "./pages/subcomision/Jornada/ConfigPrecios";
import ControlJornada from "./pages/subcomision/Jornada/ControlJornada";
import VentaBuffet from "./pages/subcomision/Jornada/VentaBuffet";
import HistorialJornada from "./pages/subcomision/Jornada/HistorialJornada"; // <--- AGREGADO

// COMPONENTE DE PROTECCIÓN
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("auth_union") === "true";
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA */}
        <Route path="/login" element={<Acceso />} />

        {/* RUTAS PROTEGIDAS */}
        <Route path="/" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        
        {/* Gestión Deportiva */}
        <Route path="/gestion" element={<ProtectedRoute><Gestion /></ProtectedRoute>} />
        <Route path="/gestion/ficha" element={<ProtectedRoute><BuscarJugador /></ProtectedRoute>} />
        <Route path="/gestion/ficha/:dni" element={<ProtectedRoute><FichaJugador /></ProtectedRoute>} />
        <Route path="/gestion/asistencias" element={<ProtectedRoute><Asistencias /></ProtectedRoute>} />
        <Route path="/gestion/convocatorias" element={<ProtectedRoute><Convocatorias /></ProtectedRoute>} />
        <Route path="/gestion/planificacion" element={<ProtectedRoute><Planificacion /></ProtectedRoute>} />
        <Route path="/gestion/planilla" element={<ProtectedRoute><PlanillaAsistencias /></ProtectedRoute>} />

        {/* Tracker de Partidos */}
        <Route path="/gestion/nuevo-partido" element={<ProtectedRoute><NuevoPartido /></ProtectedRoute>} />
        <Route path="/gestion/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/gestion/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />

        {/* Subcomisión y Cobranzas */}
        <Route path="/subcomision" element={<ProtectedRoute><Subcomision /></ProtectedRoute>} />
        <Route path="/subcomision/venta-medias" element={<ProtectedRoute><VentaMedias /></ProtectedRoute>} />   
        <Route path="/cobranzas" element={<ProtectedRoute><Cobranzas /></ProtectedRoute>} />

        {/* --- MÓDULO JORNADA (Buffet, Entradas, Gastos) --- */}
        <Route path="/subcomision/jornada" element={<ProtectedRoute><MenuJornada /></ProtectedRoute>} />
        <Route path="/subcomision/jornada/precios" element={<ProtectedRoute><ConfigPrecios /></ProtectedRoute>} />
        <Route path="/subcomision/jornada/control" element={<ProtectedRoute><ControlJornada /></ProtectedRoute>} />
        <Route path="/subcomision/jornada/buffet" element={<ProtectedRoute><VentaBuffet /></ProtectedRoute>} />
        <Route path="/subcomision/jornada/historial" element={<ProtectedRoute><HistorialJornada /></ProtectedRoute>} /> {/* <--- AGREGADO */}

        {/* Redirección por seguridad */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;