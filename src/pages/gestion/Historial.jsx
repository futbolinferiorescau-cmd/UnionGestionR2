import { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

const COLORES = { ARQUERO: "#fbbf24", DEFENSOR: "#3b82f6", MEDIOCAMPISTA: "#10b981", DELANTERO: "#ef4444" };

export default function Historial() {
  const [informes, setInformes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [detalleSel, setDetalleSel] = useState(null);

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const q = query(collection(db, "informes_partidos"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);
        const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInformes(lista);
      } catch (e) {
        console.error("Error al cargar historial:", e);
      } finally {
        setCargando(false);
      }
    };
    cargarHistorial();
  }, []);

  const formatearFecha = (ts) => {
    if (!ts) return "---";
    const d = ts.toDate();
    return d.toLocaleDateString() + " " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
  };

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" }}>
      <Navbar />
      
      <div style={{ padding: "16px" }}>
        {/* TÍTULO EN BLANCO Y CENTRADO */}
        <h2 style={tituloCentrado}>HISTORIAL DE PARTIDOS</h2>

        {cargando ? (
          <p style={{ textAlign: "center", marginTop: "50px", color: "#aaa" }}>Buscando informes en la nube...</p>
        ) : informes.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666", marginTop: "50px" }}>Todavía no hay partidos guardados.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {informes.map(inf => (
              <div key={inf.id} onClick={() => setDetalleSel(inf)} style={cardResumen}>
                <div style={{ flex: 1 }}>
                  <div style={txtCategoria}>{inf.categoria}</div>
                  <div style={txtRival}>vs {inf.rival}</div>
                  <div style={txtFecha}>{formatearFecha(inf.fecha)}</div>
                </div>
                <div style={txtResultado}>{inf.resultado}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL DE DETALLE COMPLETO --- */}
      {detalleSel && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <button onClick={() => setDetalleSel(null)} style={btnCerrar}>X CERRAR</button>
            
            <h2 style={{ color: "#fff", marginBottom: "5px", textTransform: "uppercase" }}>{detalleSel.rival}</h2>
            <div style={{ fontSize: "32px", fontWeight: "900", color: "#16a34a" }}>{detalleSel.resultado}</div>
            <p style={{ fontSize: "12px", color: "#aaa" }}>{detalleSel.categoria} | {formatearFecha(detalleSel.fecha)}</p>

            <hr style={{ border: "0.5px solid #333", margin: "20px 0" }} />

            <h3 style={subSeccion}>SUCESOS</h3>
            <div style={cajaDetalle}>
              {detalleSel.eventos?.map((e, i) => (
                <div key={i} style={itemEvento}>
                  <span style={{ color: "#16a34a", fontWeight: "bold" }}>{e.min}'</span> {e.tipo}: {e.jugador}
                </div>
              ))}
            </div>

            <h3 style={subSeccion}>MINUTOS JUGADOS</h3>
            <div style={cajaDetalle}>
              {detalleSel.estadisticas?.sort((a,b) => b.minutos - a.minutos).map((est, i) => (
                <div key={i} style={itemEstadistica}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "4px", height: "15px", background: COLORES[est.puesto] }}></div>
                    <span style={{ fontWeight: est.expulsado ? "bold" : "normal", color: est.expulsado ? "#ef4444" : "#fff" }}>
                      {est.apellido} {est.expulsado ? "(EXP)" : ""}
                    </span>
                  </div>
                  <div style={{ color: "#16a34a", fontWeight: "bold" }}>{est.minutos} min</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ESTILOS
const tituloCentrado = { 
  fontSize: "22px", 
  fontWeight: "900", 
  textAlign: "center", 
  margin: "20px 0", 
  textTransform: "uppercase",
  color: "#fff" // Blanco explícito
};

const cardResumen = { 
  background: "#111", 
  padding: "18px", 
  borderRadius: "14px", 
  border: "1px solid #222", 
  display: "flex", 
  alignItems: "center", 
  cursor: "pointer" 
};

const txtCategoria = { fontSize: "20px", color: "#16a34a", fontWeight: "bold", textTransform: "uppercase" };
const txtRival = { fontSize: "18px", fontWeight: "bold", color: "#fff" };
const txtFecha = { fontSize: "15px", color: "#666", marginTop: "4px" };
const txtResultado = { fontSize: "26px", fontWeight: "900", color: "#fff", marginLeft: "15px" };

const modalOverlay = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.98)", zIndex: 1000, overflowY: "auto", padding: "20px" };
const modalContent = { background: "#000", minHeight: "100%", textAlign: "center", paddingBottom: "50px" };
const btnCerrar = { background: "#ef4444", color: "#fff", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", marginBottom: "30px" };
const subSeccion = { fontSize: "12px", color: "#16a34a", textAlign: "left", marginTop: "25px", fontWeight: "bold", textTransform: "uppercase" };
const cajaDetalle = { background: "#111", borderRadius: "12px", padding: "12px", marginTop: "10px", textAlign: "left", border: "1px solid #222" };
const itemEvento = { fontSize: "13px", padding: "8px 0", borderBottom: "1px solid #222", color: "#ddd" };
const itemEstadistica = { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222", fontSize: "14px" };