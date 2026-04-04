import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

export default function Gestion() {
  const navigate = useNavigate();

  const opciones = [
    { numero: "1", label: "Asistencias", path: "/gestion/asistencias" },
    { numero: "2", label: "Convocatorias", path: "/gestion/convocatorias" },
    { numero: "3", label: "Ficha Jugador", path: "/gestion/ficha" },
    { numero: "4", label: "Planilla Asistencias", path: "/gestion/planilla" },
    { numero: "5", label: "Planificación Física", path: "/gestion/planificacion" },
    { numero: "6", label: "Tracker (Nuevo Partido)", path: "/gestion/nuevo-partido" },
    // NUEVA OPCIÓN: PUNTO 7
    { numero: "7", label: "Historial de Partidos", path: "/gestion/historial" },
  ];

  return (
    <div style={{ paddingBottom: "100px", background: "#111", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: 700, 
          marginBottom: "24px", 
          color: "#fff", 
          textTransform: "uppercase" 
        }}>
          Gestión
        </h1>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {opciones.map((op) => (
            <button
              key={op.path}
              onClick={() => navigate(op.path)}
              style={{
                width: "100%",
                padding: "20px",
                background: "#1e1e1e",
                border: "1px solid #2e2e2e",
                borderRadius: "14px",
                color: "#fff",
                fontSize: "16px",
                fontWeight: 600,
                textAlign: "left",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "transform 0.1s", // Para que se sienta el clic
              }}
              // Efecto de presión simple
              onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
              onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <span>{op.numero}. {op.label}</span>
              <span style={{ color: "#16a34a", fontSize: "18px", fontWeight: "900" }}>›</span>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}