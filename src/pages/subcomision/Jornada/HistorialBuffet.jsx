import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";

export default function HistorialBuffet() {
  const [ventas, setVentas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "ventas_buffet_diarias"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setVentas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const borrarVenta = async (id) => {
    if (window.confirm("¿Borrar esta compra detallada?")) {
      await deleteDoc(doc(db, "ventas_buffet_diarias", id));
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate("/subcomision/jornada/buffet")} style={styles.btnVolver}>← VOLVER A VENDER</button>
        
        <h2 style={styles.titulo}>DETALLE DE VENTAS (BUFFET)</h2>

        <div style={styles.lista}>
          {ventas.map((v) => (
            <div key={v.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.hora}>{v.fecha?.toDate()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span style={styles.user}>{v.responsable}</span>
              </div>
              <div style={styles.items}>
                {v.items?.map((it, i) => (
                  <div key={i} style={styles.itemRow}>
                    <span>{it.cantidad}x {it.nombre}</span>
                    <span>${it.subtotal}</span>
                  </div>
                ))}
              </div>
              <div style={styles.footer}>
                <span style={styles.total}>Total: ${v.total}</span>
                <button onClick={() => borrarVenta(v.id)} style={styles.btnBorrar}>BORRAR</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#000", minHeight: "100vh", color: "#fff" },
  container: { padding: "20px", maxWidth: "500px", margin: "0 auto" },
  btnVolver: { background: "#111", border: "1px solid #333", color: "#fff", padding: "10px", borderRadius: "10px", marginBottom: "20px", width: "100%" },
  titulo: { fontSize: "14px", color: "#33b5e5", marginBottom: "15px", fontWeight: "900" },
  card: { background: "#111", border: "1px solid #222", padding: "15px", borderRadius: "15px", marginBottom: "10px" },
  cardHeader: { display: "flex", justifyContent: "space-between", marginBottom: "10px", borderBottom: "1px solid #222", paddingBottom: "5px" },
  hora: { color: "#33b5e5", fontWeight: "bold", fontSize: "12px" },
  user: { color: "#555", fontSize: "10px" },
  itemRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "3px" },
  footer: { display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed #222" },
  total: { fontWeight: "bold" },
  btnBorrar: { background: "none", border: "none", color: "#ff3b30", fontSize: "11px" }
};