import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Acceso() {
  const [clave, setClave] = useState("");
  const navigate = useNavigate();

  // AQUÍ CAMBIÁS TU CONTRASEÑA
  const CLAVE_CORRECTA = "UNION2026"; 

  const verificar = () => {
    if (clave === CLAVE_CORRECTA) {
      localStorage.setItem("auth_union", "true"); // Guardamos que entró
      navigate("/"); // Lo mandamos al inicio
    } else {
      alert("Clave incorrecta. Pedila al administrador.");
      setClave("");
    }
  };

  return (
    <div style={container}>
      <img src="/images/unionas_escudo.png" alt="Logo" style={escudo} />
      <h2 style={titulo}>SISTEMA DE GESTIÓN</h2>
      <p style={sub}>INGRESE LA CLAVE DE ACCESO</p>
      
      <input 
        type="password" 
        value={clave}
        onChange={(e) => setClave(e.target.value)}
        style={input}
        placeholder="••••••••"
      />
      
      <button onClick={verificar} style={btn}>ENTRAR</button>
      
      <div style={footer}>Fútbol Inferiores ®</div>
    </div>
  );
}

// ESTILOS
const container = { background: "#000", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" };
const escudo = { width: "100px", marginBottom: "20px" };
const titulo = { color: "#fff", fontSize: "22px", fontWeight: "900", marginBottom: "5px" };
const sub = { color: "#33b5e5", fontSize: "12px", fontWeight: "bold", marginBottom: "30px" };
const input = { width: "100%", maxWidth: "300px", padding: "15px", borderRadius: "12px", border: "1px solid #333", background: "#111", color: "#fff", textAlign: "center", fontSize: "20px", marginBottom: "15px", outline: "none" };
const btn = { width: "100%", maxWidth: "300px", padding: "15px", background: "#33b5e5", border: "none", borderRadius: "12px", color: "#fff", fontWeight: "900", cursor: "pointer" };
const footer = { position: "absolute", bottom: "30px", color: "#444", fontSize: "10px", fontWeight: "bold" };