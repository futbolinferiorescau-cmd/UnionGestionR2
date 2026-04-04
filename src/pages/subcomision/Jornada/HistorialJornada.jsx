import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc 
} from "firebase/firestore"; // <--- Agregamos doc y deleteDoc
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

export default function HistorialJornada() {
  const [registros, setRegistros] = useState([]);
  const [expandido, setExpandido] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "jornadas_registros"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setRegistros(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const toggleDetalle = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  // --- FUNCIÓN PARA BORRAR REGISTRO ---
  const borrarRegistro = async (e, id) => {
    e.stopPropagation(); // Para que no se abra/cierre la tarjeta al tocar el tacho
    const confirmar = window.confirm("⚠️ ¿Estás seguro de ELIMINAR esta jornada permanentemente? No se puede deshacer.");
    
    if (confirmar) {
      try {
        await deleteDoc(doc(db, "jornadas_registros", id));
        alert("✅ Registro eliminado correctamente");
      } catch {
        alert("Error al intentar borrar el registro.");
      }
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.container}>
        <div style={styles.headerSeccion}>
            <h1 style={styles.titulo}>HISTORIAL</h1>
            <span style={styles.subtitulo}>REGISTRO OFICIAL DE JORNADAS</span>
            <div style={styles.lineaBlanca}></div>
        </div>

        {registros.map((reg) => (
          <div key={reg.id} style={styles.card} onClick={() => toggleDetalle(reg.id)}>
            <div style={styles.headerCard}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={styles.fechaTxt}>{reg.fechaTexto}</span>
                <span style={styles.respTxt}>RESP: {reg.responsable}</span>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                {/* BOTÓN DE BORRAR (TACHITO) */}
                <button 
                  onClick={(e) => borrarRegistro(e, reg.id)} 
                  style={styles.btnBorrar}
                >
                  🗑️
                </button>
                <div style={styles.btnVer}>
                  {expandido === reg.id ? "▲" : "▼"}
                </div>
              </div>
            </div>
            
            <div style={styles.bodyCard}>
              <div style={styles.filaResumen}>
                <span>Recaudado Buffet:</span> 
                <b style={{ color: "#33b5e5" }}>${reg.recaudadoBuffet}</b>
              </div>

              {expandido === reg.id && (
                <div style={styles.detalleDesplegable}>
                  
                  <p style={styles.labelDetalle}>PRODUCTOS VENDIDOS:</p>
                  <div style={styles.cajaInterna}>
                    {reg.productosVendidos && Object.keys(reg.productosVendidos).length > 0 ? (
                      Object.entries(reg.productosVendidos).map(([nombre, cantidad]) => (
                        <div key={nombre} style={styles.filaInterna}>
                          <span>{nombre}</span>
                          <span style={{color: "#33b5e5", fontWeight: "900"}}>x{cantidad}</span>
                        </div>
                      ))
                    ) : (
                      <p style={styles.vacioTxt}>Sin registro de productos.</p>
                    )}
                  </div>

                  <p style={styles.labelDetalle}>OTROS MOVIMIENTOS:</p>
                  <div style={styles.cajaInterna}>
                    {reg.movimientos && reg.movimientos.length > 0 ? (
                      reg.movimientos.map((m, i) => (
                        <div key={i} style={styles.filaInterna}>
                          <span style={{color: m.tipo === "INGRESO" ? "#16a34a" : "#ef4444", fontSize: "10px"}}>
                            {m.tipo === "INGRESO" ? "▲" : "▼"}
                          </span>
                          <span style={{flex: 1, marginLeft: "8px"}}>{m.categoria}</span>
                          <span>${m.monto}</span>
                        </div>
                      ))
                    ) : (
                      <p style={styles.vacioTxt}>Sin movimientos manuales.</p>
                    )}
                  </div>

                </div>
              )}

              <div style={styles.balanceFinal}>
                <span>TOTAL EN CAJA:</span>
                <span style={{ color: reg.balanceFinal >= 0 ? "#33b5e5" : "#ff4444" }}>
                  ${reg.balanceFinal}
                </span>
              </div>
            </div>
          </div>
        ))}

        {registros.length === 0 && (
          <p style={{textAlign: "center", color: "#444", marginTop: "50px"}}>No hay jornadas cerradas.</p>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

const styles = {
  page: { background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" },
  container: { padding: "20px", maxWidth: "600px", margin: "0 auto" },
  headerSeccion: { textAlign: "center", marginBottom: "30px" },
  titulo: { fontSize: "28px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "2px" },
  subtitulo: { fontSize: "11px", color: "#33b5e5", fontWeight: "bold", letterSpacing: "1px" },
  lineaBlanca: { height: "5px", background: "#fff", width: "100%", marginTop: "15px", borderRadius: "2px" },

  card: { background: "#111", borderRadius: "18px", border: "1px solid #222", marginBottom: "15px", overflow: "hidden", cursor: "pointer" },
  headerCard: { background: "#161616", padding: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #222" },
  fechaTxt: { fontSize: "15px", fontWeight: "900", color: "#fff" },
  respTxt: { fontSize: "10px", color: "#666", fontWeight: "bold", textTransform: "uppercase" },
  
  // ESTILO BOTÓN BORRAR
  btnBorrar: { 
    background: "transparent", 
    border: "none", 
    fontSize: "18px", 
    cursor: "pointer", 
    padding: "5px",
    opacity: 0.6,
    transition: "0.2s"
  },

  btnVer: { fontSize: "10px", color: "#33b5e5", fontWeight: "900" },

  bodyCard: { padding: "15px" },
  filaResumen: { display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#aaa" },
  detalleDesplegable: { marginTop: "15px", borderTop: "1px solid #222", paddingTop: "15px" },
  labelDetalle: { fontSize: "10px", color: "#444", fontWeight: "900", marginBottom: "8px" },
  cajaInterna: { background: "#080808", padding: "12px", borderRadius: "12px", border: "1px solid #1a1a1a", marginBottom: "12px" },
  filaInterna: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "6px", color: "#eee" },
  vacioTxt: { fontSize: "11px", color: "#333", margin: 0 },
  balanceFinal: { display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: "900", marginTop: "15px", borderTop: "2px solid #222", paddingTop: "15px" }
};