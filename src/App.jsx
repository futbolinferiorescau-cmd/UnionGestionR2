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
// --- NUEVA IMPORTACIÓN ---
import Planificacion from "./pages/gestion/Planificacion"; 

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
        
        {/* --- NUEVA RUTA DE PLANIFICACIÓN --- */}
        <Route path="/gestion/planificacion" element={<Planificacion />} />

        <Route path="/gestion/planilla" element={<PlanillaAsistencias />} />
        <Route path="/subcomision" element={<Subcomision />} />
        <Route path="/cobranzas" element={<Cobranzas />} />

        {/* Redirección por seguridad */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;