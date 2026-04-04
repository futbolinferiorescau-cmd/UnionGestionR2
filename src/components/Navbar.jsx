import React from "react";

export default function Navbar() {
  // Generamos el código R + DDMMYY
  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, '0');
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const año = String(hoy.getFullYear()).substring(2);
  const codigoRegistro = `R${dia}${mes}${año}`;

  return (
    <>
      {/* Importamos la fuente para el sello del creador */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');`}
      </style>

      <nav style={navStyle}>
        <div style={container}>
          
          {/* IZQUIERDA: ESCUDO + IDENTIDAD */}
          <div style={brandSectionWrapper}>
            <div style={escudoWrapper}>
              <img src="/images/unionas_escudo.png" alt="Logo" style={imgEscudoStyle} />
            </div>

            <div style={brandTextWrapper}>
              <h1 style={mainTitle}>
                UNIÓN <span style={gestionBadge}>GESTIÓN</span>
              </h1>
              <h2 style={subTitle}>ARROYO SECO</h2>
            </div>
          </div>

          {/* DERECHA: SELLO Y REGISTRO (MÁS JUNTOS) */}
          <div style={registroWrapper}>
            <div style={creatorText}>Futbol Inferiores ®</div>
            <div style={regCodeText}>{codigoRegistro}</div>
          </div>

        </div>
      </nav>
    </>
  );
}

// ESTILOS
const navStyle = {
  background: "#222", 
  padding: "8px 16px",
  borderBottom: "1px solid #333",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  height: "55px",
  display: "flex",
  alignItems: "center",
};

const container = {
  display: "flex",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
};

const brandSectionWrapper = {
  display: "flex",
  alignItems: "center",
  gap: "8px", 
};

const escudoWrapper = {
  width: "35px", 
  height: "35px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imgEscudoStyle = {
  width: "100%", 
  height: "100%",
  objectFit: "contain",
};

const brandTextWrapper = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  fontFamily: "sans-serif", 
};

const mainTitle = {
  color: "#fff",
  fontSize: "16px", 
  fontWeight: "900",
  margin: 0,
  lineHeight: "0.8",
  letterSpacing: "-0.2px",
  textTransform: "uppercase",
};

const gestionBadge = {
  color: "#33b5e5", // CELESTE
  fontSize: "13px",
  fontWeight: "900",
};

const subTitle = {
  color: "#aaa", 
  fontSize: "9px",
  fontWeight: "900",
  margin: 0,
  lineHeight: "1",
  letterSpacing: "2.2px", 
  textTransform: "uppercase",
};

// --- AJUSTE AQUÍ: TODO MÁS PEGADO ---
const registroWrapper = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  lineHeight: "1.5", // Hace que las líneas se acerquen
};

const creatorText = {
  color: "#fff",
  fontSize: "9px", 
  textTransform: "uppercase",
  fontFamily: "'Permanent Marker', cursive",
  opacity: 0.9,
  margin: 0,
  padding: 0,
};

const regCodeText = {
  color: "#33b5e5", // CELESTE
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "1px",
  fontFamily: "sans-serif",
  margin: 0,
  padding: 0,
  marginTop: "-2px", // Subimos el texto un poquito más
};