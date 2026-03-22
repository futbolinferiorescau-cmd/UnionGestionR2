import { useNavigate } from "react-router-dom";

export default function Inicio() {
  const navigate = useNavigate();

  const modulos = [
    { label: "Gestión de Jugadores", path: "/gestion" },
    { label: "Subcomisión", path: "/subcomision" },
    { label: "Cobranzas", path: "/cobranzas" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#111",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <img
        src="/images/unionas_escudo.png"
        alt="Escudo"
        style={{ width: "160px", objectFit: "contain", marginBottom: "24px" }}
      />

      <h1 style={{
        fontSize: "22px",
        fontWeight: 700,
        letterSpacing: "2px",
        textTransform: "uppercase",
        marginBottom: "25px",
        color: "#fff",
      }}>
        Club Atlético Unión - Arroyo Seco
      </h1>

      <div style={{
        width: "40px",
        height: "2px",
        background: "#ffffff",
        marginBottom: "48px",
      }} />

      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "16px" }}>
        {modulos.map((modulo) => (
          <button
            key={modulo.path}
            onClick={() => navigate(modulo.path)}
            style={{
              width: "100%",
              padding: "18px",
              background: "#1e1e1e",
              border: "1px solid #2e2e2e",
              borderRadius: "14px",
              color: "#fff",
              fontSize: "15px",
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {modulo.label}
            <span style={{ color: "#555", fontSize: "18px" }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}