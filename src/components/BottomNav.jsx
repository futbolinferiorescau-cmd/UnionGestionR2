import { useNavigate } from "react-router-dom";

const IconAtras = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#33b5e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconHome = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#33b5e5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BottomNav() {
  const navigate = useNavigate();

  return (
    <nav style={navStyle}>
      <div style={container}>
        {/* BOTÓN ATRÁS */}
        <button 
          onClick={() => navigate(-1)} 
          style={btnStyle}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <IconAtras />
          <span style={textStyle}>ATRÁS</span>
        </button>

        {/* ESCUDO FLOTANTE CENTRAL */}
        <div style={escudoWrapper}>
          <img src="/images/unionas_escudo.png" alt="U" style={imgEscudoStyle} />
        </div>

        {/* BOTÓN INICIO */}
        <button 
          onClick={() => navigate("/")} 
          style={btnStyle}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.9)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <IconHome />
          <span style={textStyle}>INICIO</span>
        </button>
      </div>
    </nav>
  );
}

// ESTILOS
const navStyle = {
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  background: "#111", 
  borderTop: "1px solid #222",
  padding: "8px 0 15px 0", 
  zIndex: 1000,
};

const container = {
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
  maxWidth: "500px",
  margin: "0 auto",
};

const btnStyle = {
  background: "none",
  border: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "2px",
  cursor: "pointer",
  transition: "transform 0.1s ease",
  flex: 1,
};

const textStyle = {
  color: "#fff",
  fontSize: "9px",
  fontWeight: "900",
  letterSpacing: "0.5px",
  textTransform: "uppercase",
};

const escudoWrapper = {
  width: "48px",
  height: "48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const imgEscudoStyle = {
  width: "100%", 
  height: "100%",
  objectFit: "contain",
};