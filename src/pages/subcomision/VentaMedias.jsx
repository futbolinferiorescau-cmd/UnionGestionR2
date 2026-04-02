import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function VentaMedias() {
  const [jugadores, setJugadores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [busquedaPibe, setBusquedaPibe] = useState("");
  const [pibeSeleccionado, setPibeSeleccionado] = useState(null);
  
  const [tipoMedia, setTipoMedia] = useState("ANTIDESLIZANTE");
  const [cantidad, setCantidad] = useState(1);
  const [pagoInicial, setPagoInicial] = useState(10000);
  
  const [filtroNombre, setFiltroNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const PRECIO_UNIDAD = 15000;

  useEffect(() => {
    const fetchData = async () => {
      const snapJ = await getDocs(query(collection(db, "JUGADORES"), orderBy("APELLIDO", "asc")));
      setJugadores(snapJ.docs.map(d => ({ id: d.id, ...d.data() })));
      const snapV = await getDocs(query(collection(db, "VENTA_MEDIAS"), orderBy("fecha", "desc")));
      setVentas(snapV.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const guardarVenta = async () => {
    if (!pibeSeleccionado) return alert("Seleccioná un pibe");
    setCargando(true);
    const montoTotal = PRECIO_UNIDAD * cantidad;
    const saldo = montoTotal - (pagoInicial * cantidad);

    try {
      const docRef = await addDoc(collection(db, "VENTA_MEDIAS"), {
        jugadorId: pibeSeleccionado.DNI,
        nombre: `${pibeSeleccionado.APELLIDO} ${pibeSeleccionado.NOMBRE}`,
        categoria: pibeSeleccionado.CATEGORIA || "S/D",
        tipo: tipoMedia,
        cantidad: Number(cantidad),
        total: montoTotal,
        pagado: pagoInicial * cantidad,
        saldo: saldo,
        fecha: serverTimestamp(),
      });
      
      setVentas([{ id: docRef.id, nombre: `${pibeSeleccionado.APELLIDO} ${pibeSeleccionado.NOMBRE}`, tipo: tipoMedia, cantidad: Number(cantidad), pagado: pagoInicial * cantidad, saldo: saldo }, ...ventas]);
      setPibeSeleccionado(null);
      setBusquedaPibe("");
      alert("¡Venta registrada!");
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const eliminarVenta = async (id) => {
    if (window.confirm("¿Borrar esta venta?")) {
      await deleteDoc(doc(db, "VENTA_MEDIAS", id));
      setVentas(ventas.filter(v => v.id !== id));
    }
  };

  const filtrados = ventas.filter(v => v.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "40px" }}>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        
        <button onClick={() => navigate(-1)} style={styles.btnAtras}>← VOLVER</button>
        <h2 style={styles.titulo}>VENTA DE MEDIAS</h2>

        <div style={styles.card}>
          <p style={styles.label}>1. BUSCAR JUGADOR</p>
          <input placeholder="Apellido del pibe..." value={busquedaPibe} onChange={e => setBusquedaPibe(e.target.value)} style={styles.input} />
          {busquedaPibe && !pibeSeleccionado && (
            <div style={styles.sugerencias}>
              {jugadores.filter(j => j.APELLIDO.toLowerCase().includes(busquedaPibe.toLowerCase())).slice(0, 5).map(j => (
                <div key={j.DNI} onClick={() => { setPibeSeleccionado(j); setBusquedaPibe(`${j.APELLIDO} ${j.NOMBRE}`); }} style={styles.sugItem}>
                  {j.APELLIDO} {j.NOMBRE}
                </div>
              ))}
            </div>
          )}

          {pibeSeleccionado && (
            <div style={{ marginTop: "15px", borderTop: "1px solid #333", paddingTop: "15px" }}>
              <select value={tipoMedia} onChange={e => setTipoMedia(e.target.value)} style={styles.input}>
                <option value="ANTIDESLIZANTE">ANTIDESLIZANTE</option>
                <option value="PANTORRILLERA">PANTORRILLERA</option>
                <option value="MEDIA ENTERA">MEDIA ENTERA</option>
              </select>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} style={styles.input} placeholder="Cant" />
                <input type="number" value={pagoInicial} onChange={e => setPagoInicial(e.target.value)} style={styles.input} placeholder="Entrega" />
              </div>
              <button onClick={guardarVenta} disabled={cargando} style={styles.btnCargar}>
                {cargando ? "GUARDANDO..." : "REGISTRAR VENTA"}
              </button>
            </div>
          )}
        </div>

        <h3 style={{ marginTop: "30px", fontSize: "12px", color: "#666", letterSpacing: "1px" }}>HISTORIAL DE VENTAS</h3>
        <input placeholder="Filtrar por nombre..." value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} style={{ ...styles.input, marginBottom: "15px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtrados.map(v => (
            <div key={v.id} style={styles.item}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>{v.nombre}</p>
                <p style={{ margin: 0, fontSize: "11px", color: "#888" }}>{v.tipo} x{v.cantidad}</p>
              </div>
              <div style={{ textAlign: "right", marginRight: "12px" }}>
                <p style={{ margin: 0, fontSize: "11px", color: "#4CD964" }}>PAGÓ: ${v.pagado}</p>
                <p style={{ margin: 0, fontWeight: "900", fontSize: "14px", color: v.saldo <= 0 ? "#4CD964" : "#FF9500" }}>
                  {v.saldo <= 0 ? "AL DÍA ✅" : `DEBE: $${v.saldo}`}
                </p>
              </div>
              <button onClick={() => eliminarVenta(v.id)} style={styles.btnBorrar}>🗑️</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  btnAtras: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px 15px", borderRadius: "10px", marginBottom: "20px", cursor: "pointer" },
  titulo: { textAlign: "center", color: "#fff", fontWeight: "900", fontSize: "24px", marginBottom: "25px", textTransform: "uppercase" },
  card: { background: "#1e1e1e", padding: "20px", borderRadius: "20px", border: "1px solid #2e2e2e" },
  input: { background: "#111", border: "1px solid #333", color: "#fff", padding: "12px", borderRadius: "10px", width: "100%", boxSizing: "border-box", outline: "none", marginBottom: "5px" },
  label: { fontSize: "12px", color: "#0A84FF", marginBottom: "8px", fontWeight: "bold" },
  sugerencias: { background: "#222", borderRadius: "10px", overflow: "hidden" },
  sugItem: { padding: "12px", borderBottom: "1px solid #333", cursor: "pointer" },
  btnCargar: { background: "#0A84FF", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "bold", width: "100%", marginTop: "10px", cursor: "pointer" },
  item: { background: "#1e1e1e", padding: "12px 15px", borderRadius: "15px", display: "flex", alignItems: "center", border: "1px solid #222" },
  btnBorrar: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "5px" }
};