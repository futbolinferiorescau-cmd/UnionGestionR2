import React from "react";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Subcomision() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "80px" }}>
      <Navbar />
      
      <div style={{ padding: "24px 16px", maxWidth: "600px", margin: "0 auto" }}>
        {/* TÍTULO EN BLANCO Y MAYÚSCULAS */}
        <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", color: "#fff" }}>
            SUBCOMISIÓN
        </h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>Gestión administrativa del club</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* --- NUEVO BOTÓN: CONTROL DE JORNADA --- */}
          <div 
            onClick={() => navigate("/subcomision/jornada")}
            style={styles.card}
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>🏟️</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#fff" }}>Control de Jornada</h2>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>Buffet, Entradas y Gastos</p>
            </div>
            <div style={{ color: "#0A84FF", fontSize: "20px" }}>→</div>
          </div>

          {/* BOTÓN EXISTENTE: VENTA DE MEDIAS */}
          <div 
            onClick={() => navigate("/subcomision/venta-medias")}
            style={styles.card}
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>🧦</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#fff" }}>Venta de Medias</h2>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>Registro de ventas y recaudación</p>
            </div>
            <div style={{ color: "#0A84FF", fontSize: "20px" }}>→</div>
          </div>

        </div>
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  card: { 
    background: "#1e1e1e", 
    padding: "20px", 
    borderRadius: "20px", 
    border: "1px solid #2e2e2e", 
    display: "flex", 
    alignItems: "center", 
    cursor: "pointer" 
  },
  iconBox: { 
    width: "50px", 
    height: "50px", 
    background: "rgba(10, 132, 255, 0.1)", 
    borderRadius: "12px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: "16px" 
  }
};