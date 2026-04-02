import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// IMPORTACIÓN DE PÁGINAS
import Inicio from "./pages/Inicio";
import Gestion from "./pages/gestion/Gestion";
import BuscarJugador from "./pages/gestion/BuscarJugador"; // El que tiene la lista
import FichaJugador from "./pages/gestion/FichaJugador";   // El que tiene el detalle
import Asistencias from "./pages/gestion/Asistencias";
import Convocatorias from "./pages/gestion/Convocatorias";
import PlanillaAsistencias from "./pages/gestion/PlanillaAsistencias";
import Subcomision from "./pages/subcomision/Subcomision";
import Cobranzas from "./pages/cobranzas/Cobranzas";
import VentaMedias from "./pages/subcomision/VentaMedias";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pantalla principal */}
        <Route path="/" element={<Inicio />} />
        
        {/* Menú de Gestión */}
        <Route path="/gestion" element={<Gestion />} />

        {/* --- EL SECTOR DEL ERROR --- */}
        
        {/* 1. Esta ruta muestra la LISTA (Buscador) */}
        <Route path="/gestion/ficha" element={<BuscarJugador />} />
        
        {/* 2. Esta ruta muestra el DETALLE (Ficha individual) 
            Fijate que acá el element TIENE que ser FichaJugador */}
        <Route path="/gestion/ficha/:dni" element={<FichaJugador />} />

        {/* --- FIN DEL SECTOR DEL ERROR --- */}
        
        <Route path="/subcomision/venta-medias" element={<VentaMedias />} />   
        {/* Otras rutas de la App */}
        <Route path="/gestion/asistencias" element={<Asistencias />} />
        <Route path="/gestion/convocatorias" element={<Convocatorias />} />
        <Route path="/gestion/planilla" element={<PlanillaAsistencias />} />
        <Route path="/subcomision" element={<Subcomision />} />
        <Route path="/cobranzas" element={<Cobranzas />} />

        {/* Redirección por seguridad: si la ruta no existe, vuelve al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;