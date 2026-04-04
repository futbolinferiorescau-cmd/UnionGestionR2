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

// --- NUEVAS IMPORTACIONES PARA EL TRACKER Y EL HISTORIAL ---
import NuevoPartido from "./pages/gestion/NuevoPartido";
import Tracker from "./pages/gestion/Tracker";
import Historial from "./pages/gestion/Historial"; // <--- AGREGADO

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla principal */}
        <Route path="/" element={<Inicio />} />
        
        {/* Menú de Gestión */}
        <Route path="/gestion" element={<Gestion />} />

        {/* Sector Fichas */}
        <Route path="/gestion/ficha" element={<BuscarJugador />} />
        <Route path="/gestion/ficha/:dni" element={<FichaJugador />} />
        
        <Route path="/subcomision/venta-medias" element={<VentaMedias />} />   
        
        {/* Rutas para Profes y PF */}
        <Route path="/gestion/asistencias" element={<Asistencias />} />
        <Route path="/gestion/convocatorias" element={<Convocatorias />} />
        <Route path="/gestion/planificacion" element={<Planificacion />} />
        <Route path="/gestion/planilla" element={<PlanillaAsistencias />} />

        {/* --- RUTAS DEL TRACKER E INFORMES --- */}
        {/* 1. Para armar el equipo antes del partido */}
        <Route path="/gestion/nuevo-partido" element={<NuevoPartido />} />
        {/* 2. Para seguir el partido en vivo con el cronómetro */}
        <Route path="/gestion/tracker" element={<Tracker />} />
        {/* 3. Para ver los informes guardados de Firestore */}
        <Route path="/gestion/historial" element={<Historial />} /> {/* <--- AGREGADO */}

        {/* Otras Rutas */}
        <Route path="/subcomision" element={<Subcomision />} />
        <Route path="/cobranzas" element={<Cobranzas />} />

        {/* Redirección por seguridad */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;