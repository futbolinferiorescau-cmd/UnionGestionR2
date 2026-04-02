import { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

export default function Planificacion() {
  const [semana, setSemana] = useState(10);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);

  // FUNCIÓN MÁGICA: Calcula los días según el número de semana
  const obtenerRangoFechas = (num) => {
    // Tomamos como base que la Semana 10 es el lunes 6 de Abril de 2026
    const fechaBase = new Date(2026, 3, 6); // Mes 3 es Abril en JS
    const diasDeDiferencia = (num - 10) * 7;
    
    const lunes = new Date(fechaBase);
    lunes.setDate(fechaBase.getDate() + diasDeDiferencia);
    
    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);

    const opciones = { day: 'numeric' };
    const mesOpciones = { month: 'long' };

    return `del ${lunes.toLocaleDateString('es-AR', opciones)} al ${viernes.toLocaleDateString('es-AR', opciones)} de ${lunes.toLocaleDateString('es-AR', mesOpciones)}`;
  };

  useEffect(() => {
    const obtenerPlan = async () => {
      setCargando(true);
      try {
        const docRef = doc(db, "planificaciones", `Semana_${semana}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDatos(docSnap.data());
        } else {
          setDatos(null);
        }
      } catch {
        setDatos(null);
      }
      setCargando(false);
    };
    obtenerPlan();
  }, [semana]);

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "100px", color: "#fff" }}>
      <Navbar />
      
      <div style={{ padding: "20px 16px" }}>
        {/* TÍTULO EN BLANCO PURO */}
        <h1 style={{ fontSize: "26px", fontWeight: "900", color: "#ffffff", marginBottom: "5px", textTransform: "uppercase" }}>
          Planificación
        </h1>
        
        {/* REFERENCIA DE FECHAS DINÁMICA */}
        <p style={{ fontSize: "14px", color: "#16a34a", fontWeight: "bold", marginBottom: "20px", textTransform: "uppercase" }}>
          Semana {semana}: {obtenerRangoFechas(semana)}
        </p>

        {/* SELECTOR DE SEMANA PRO */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between",
          background: "#1e1e1e", 
          padding: "10px 20px", 
          borderRadius: "15px",
          marginBottom: "25px",
          border: "1px solid #333"
        }}>
          <button 
            onClick={() => setSemana(prev => Math.max(1, prev - 1))}
            style={btnStyle}
          > 
            ◀ 
          </button>
          
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "12px", color: "#666", display: "block" }}>SEMANA</span>
            <span style={{ fontSize: "24px", fontWeight: "900" }}>{semana}</span>
          </div>

          <button 
            onClick={() => setSemana(prev => prev + 1)}
            style={btnStyle}
          > 
            ▶ 
          </button>
        </div>

        {cargando ? (
          <p style={{ textAlign: "center", color: "#555" }}>Buscando...</p>
        ) : datos ? (
          <div style={{ animation: "fadeIn 0.3s ease-in" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "10px" }}>
              {datos.titulo}
            </h2>
            <p style={{ color: "#bbb", fontSize: "15px", lineHeight: "1.5", marginBottom: "20px" }}>
              {datos.descripcion}
            </p>
            
            <div style={{ borderRadius: "15px", overflow: "hidden", border: "1px solid #333", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
              <img src={datos.imagenUrl} alt="Plan" style={{ width: "100%", display: "block" }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "40px", color: "#444", border: "2px dashed #222", borderRadius: "20px" }}>
            No hay planificación cargada para la semana {semana}.
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

const btnStyle = {
  background: "#333",
  color: "#fff",
  border: "none",
  borderRadius: "50%",
  width: "45px",
  height: "45px",
  fontSize: "18px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};