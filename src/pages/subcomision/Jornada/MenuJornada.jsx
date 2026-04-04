import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

export default function MenuJornada() {
  const navigate = useNavigate();

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "80px" }}>
      <Navbar />
      
      <div style={{ padding: "24px 16px", maxWidth: "600px", margin: "0 auto" }}>
        {/* TÍTULO EN MAYÚSCULAS Y CELESTE */}
        <h1 style={{ fontSize: "28px", fontWeight: "900", marginBottom: "8px", color: "#fff" }}>
            JORNADA
        </h1>
        <p style={{ color: "#33b5e5", fontWeight: "bold", fontSize: "12px", marginBottom: "30px", textTransform: "uppercase" }}>
          Gestión de Buffet, Entradas y Gastos
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 1. BOTÓN: CAJA RÁPIDA BUFFET */}
          <div 
            onClick={() => navigate("/subcomision/jornada/buffet")}
            style={styles.card}
            className="card-clicable" // <--- EFECTO AGREGADO
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>🍔</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.cardTitle}>Venta Buffet</h2>
              <p style={styles.cardSub}>Caja rápida (estilo fast food)</p>
            </div>
            <div style={styles.flecha}>→</div>
          </div>

          {/* 2. BOTÓN: BALANCE DEL DÍA */}
          <div 
            onClick={() => navigate("/subcomision/jornada/control")}
            style={styles.card}
            className="card-clicable" // <--- EFECTO AGREGADO
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>📊</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.cardTitle}>Balance de Fecha</h2>
              <p style={styles.cardSub}>Carga de ingresos y egresos</p>
            </div>
            <div style={styles.flecha}>→</div>
          </div>

          {/* 3. BOTÓN: LISTA DE PRECIOS */}
          <div 
            onClick={() => navigate("/subcomision/jornada/precios")}
            style={styles.card}
            className="card-clicable" // <--- EFECTO AGREGADO
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>🏷️</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.cardTitle}>Lista de Precios</h2>
              <p style={styles.cardSub}>Configurar menú del Buffet</p>
            </div>
            <div style={styles.flecha}>→</div>
          </div>

          {/* 4. BOTÓN: HISTORIAL */}
          <div 
            onClick={() => navigate("/subcomision/jornada/historial")}
            style={styles.card}
            className="card-clicable" // <--- EFECTO AGREGADO
          >
            <div style={styles.iconBox}>
              <span style={{ fontSize: "24px" }}>📅</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={styles.cardTitle}>Historial</h2>
              <p style={styles.cardSub}>Consultar jornadas anteriores</p>
            </div>
            <div style={styles.flecha}>→</div>
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
    cursor: "pointer",
    transition: "all 0.1s ease" // Para que el efecto sea fluido
  },
  iconBox: { 
    width: "50px", 
    height: "50px", 
    background: "rgba(51, 181, 229, 0.1)", 
    borderRadius: "12px", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    marginRight: "16px" 
  },
  cardTitle: { margin: 0, fontSize: "18px", fontWeight: "600", color: "#fff" },
  cardSub: { margin: "4px 0 0", fontSize: "14px", color: "#666" },
  flecha: { color: "#33b5e5", fontSize: "20px" }
};