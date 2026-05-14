import React, { useState, useEffect, useRef } from "react"; // Sumamos useRef
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Subcomision() {
  const navigate = useNavigate();
  const [autorizado, setAutorizado] = useState(false);
  
  // Esta referencia nos sirve para saber si ya preguntamos la clave
  const yaPregunto = useRef(false);

  useEffect(() => {
    // Si ya preguntamos en esta carga, no hacemos nada
    if (yaPregunto.current) return;

    const CLAVE_ACCESO = "2306"; 
    
    const checkAccess = () => {
      // Marcamos que ya estamos preguntando
      yaPregunto.current = true;

      const pass = prompt("Introduzca la clave de acceso de Subcomisión:");
      
      if (pass === CLAVE_ACCESO) {
        setAutorizado(true);
      } else {
        if (pass !== null) {
          alert("Clave incorrecta.");
        }
        navigate("/");
      }
    };

    checkAccess();
  }, [navigate]);

  if (!autorizado) return null;

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "80px" }}>
      <Navbar />
      <div style={{ padding: "24px 16px", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "900", color: "#fff" }}>SUBCOMISIÓN</h1>
        <p style={{ color: "#888", marginBottom: "30px" }}>Gestión administrativa del club</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div onClick={() => navigate("/subcomision/jornada")} style={styles.card}>
            <div style={styles.iconBox}><span>🏟️</span></div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Control de Jornada</h2>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>Buffet, Entradas y Gastos</p>
            </div>
            <div style={{ color: "#0A84FF" }}>→</div>
          </div>

          <div onClick={() => navigate("/subcomision/venta-medias")} style={styles.card}>
            <div style={styles.iconBox}><span>🧦</span></div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: "18px", color: "#fff" }}>Venta de Medias</h2>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#666" }}>Registro de ventas y recaudación</p>
            </div>
            <div style={{ color: "#0A84FF" }}>→</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  card: { background: "#1e1e1e", padding: "20px", borderRadius: "20px", border: "1px solid #2e2e2e", display: "flex", alignItems: "center", cursor: "pointer" },
  iconBox: { width: "50px", height: "50px", background: "rgba(10, 132, 255, 0.1)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "16px" }
};