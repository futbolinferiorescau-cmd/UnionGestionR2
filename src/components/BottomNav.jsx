import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Jugadores", path: "/gestion", icon: ( <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg> ) },
    { label: "Asistencia", path: "/gestion/asistencias", icon: ( <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3" width="14" height="11" rx="1" /><path d="M5 3V1M11 3V1M1 7h14" /></svg> ) },
    { label: "Convocat.", path: "/gestion/convocatorias", icon: ( <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M5 8h6M8 5v6" /></svg> ) },
    {
      label: "Planif.",
      path: "/gestion/planificacion",
      icon: (
        <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 2h10v12H3z" /><path d="M5 5h6M5 8h6M5 11h4" />
        </svg>
      ),
    },
    { label: "Tesorería", path: "/subcomision", icon: ( <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="14" height="10" rx="1" /><path d="M5 4V2h6v2" /></svg> ) },
    { label: "Cobranzas", path: "/cobranzas", icon: ( <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v6M6 7h3.5a1.5 1.5 0 010 3H6" /></svg> ) },
  ];

  return (
    <nav style={{
      position: "fixed",
      bottom: 0,
      right: 0,
      background: "#1a1a1a",
      borderTop: "1px solid #2e2e2e",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "8px 0 16px",
      zIndex: 100,
      maxWidth: "600px",
      margin: "0 auto",
      left: "50%",
      transform: "translateX(-50%)",
      width: "100%",
    }}>
      {items.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            background: location.pathname === item.path ? "#2e2e2e" : "none",
            border: "none",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "4px",
            padding: "6px 8px",
            color: location.pathname === item.path ? "#fff" : "#555",
            minWidth: "55px",
          }}
        >
          {item.icon}
          <span style={{ fontSize: "9px", whiteSpace: "nowrap" }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}