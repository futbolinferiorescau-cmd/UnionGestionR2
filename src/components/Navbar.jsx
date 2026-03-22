import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Inicio", path: "/" },
    { label: "Gestión de Jugadores", path: "/gestion" },
    { label: "Subcomisión", path: "/subcomision" },
    { label: "Cobranzas", path: "/cobranzas" },
  ];

  return (
    <>
      <nav style={{
        background: "#1a1a1a",
        borderBottom: "1px solid #2e2e2e",
        padding: "0 16px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/images/unionas_escudo.png"
            alt="Escudo"
            style={{ width: "36px", height: "36px", objectFit: "contain" }}
          />
          <div>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>Unión Gestión</div>
            <div style={{ fontSize: "10px", color: "#666" }}>Arroyo Seco</div>
          </div>
        </div>

        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          style={{ background: "none", border: "none", display: "flex", flexDirection: "column", gap: "5px" }}
        >
          <span style={{ display: "block", width: "22px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "#fff", borderRadius: "2px" }} />
          <span style={{ display: "block", width: "22px", height: "2px", background: "#fff", borderRadius: "2px" }} />
        </button>
      </nav>

      {menuAbierto && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 200,
        }} onClick={() => setMenuAbierto(false)}>
          <div style={{
            width: "260px",
            height: "100%",
            background: "#1a1a1a",
            borderRight: "1px solid #2e2e2e",
            padding: "20px 0",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "16px 20px 24px", borderBottom: "1px solid #2e2e2e", display: "flex", alignItems: "center", gap: "12px" }}>
              <img src="/images/unionas_escudo.png" alt="Escudo" style={{ width: "44px", objectFit: "contain" }} />
              <div>
                <div style={{ fontWeight: 600 }}>Unión Gestión</div>
                <div style={{ fontSize: "11px", color: "#666" }}>Club A. Unión · Arroyo Seco</div>
              </div>
            </div>

            {navItems.map((item) => (
              <div
                key={item.path}
                onClick={() => { navigate(item.path); setMenuAbierto(false); }}
                style={{
                  padding: "14px 20px",
                  color: location.pathname === item.path ? "#fff" : "#aaa",
                  background: location.pathname === item.path ? "#222" : "transparent",
                  borderLeft: location.pathname === item.path ? "3px solid #fff" : "3px solid transparent",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}