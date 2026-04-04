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

// --- NUEVA PÁGINA DE ACCESO ---
import Acceso from "./pages/Acceso"; 

// COMPONENTE DE PROTECCIÓN
// Este componente chequea si el usuario ya puso la clave
const ProtectedRoute = ({ children }) => {
  const isAuth = localStorage.getItem("auth_union") === "true";
  return isAuth ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: El "Muro" de entrada */}
        <Route path="/login" element={<Acceso />} />

        {/* TODAS LAS RUTAS PROTEGIDAS (Solo entran con clave) */}
        <Route path="/" element={<ProtectedRoute><Inicio /></ProtectedRoute>} />
        
        <Route path="/gestion" element={<ProtectedRoute><Gestion /></ProtectedRoute>} />
        <Route path="/gestion/ficha" element={<ProtectedRoute><BuscarJugador /></ProtectedRoute>} />
        <Route path="/gestion/ficha/:dni" element={<ProtectedRoute><FichaJugador /></ProtectedRoute>} />
        
        <Route path="/subcomision/venta-medias" element={<ProtectedRoute><VentaMedias /></ProtectedRoute>} />   
        
        <Route path="/gestion/asistencias" element={<ProtectedRoute><Asistencias /></ProtectedRoute>} />
        <Route path="/gestion/convocatorias" element={<ProtectedRoute><Convocatorias /></ProtectedRoute>} />
        <Route path="/gestion/planificacion" element={<ProtectedRoute><Planificacion /></ProtectedRoute>} />
        <Route path="/gestion/planilla" element={<ProtectedRoute><PlanillaAsistencias /></ProtectedRoute>} />

        <Route path="/gestion/nuevo-partido" element={<ProtectedRoute><NuevoPartido /></ProtectedRoute>} />
        <Route path="/gestion/tracker" element={<ProtectedRoute><Tracker /></ProtectedRoute>} />
        <Route path="/gestion/historial" element={<ProtectedRoute><Historial /></ProtectedRoute>} />

        <Route path="/subcomision" element={<ProtectedRoute><Subcomision /></ProtectedRoute>} />
        <Route path="/cobranzas" element={<ProtectedRoute><Cobranzas /></ProtectedRoute>} />

        {/* Redirección por seguridad: Si se pierde, va al inicio (que lo mandará al login si no tiene clave) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;