import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const TALLES = [
  "CHICAS (talle 30)",
  "MEDIANAS (talle 37)",
  "GRANDES (talle 40)",
  "EXTRA GRANDE (talle +40)"
];

const TIPOS = ["ANTIDESLIZANTE", "PANTORRILLERA", "MEDIA ENTERA", "SHORT", "CAMISETA"];

export default function VentaMedias() {
  const [jugadores, setJugadores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [busquedaPibe, setBusquedaPibe] = useState("");
  const [pibeSeleccionado, setPibeSeleccionado] = useState(null);
  
  // Estado para controlar qué ficha del historial está abierta
  const [idVentaAbierta, setIdVentaAbierta] = useState(null);

  const [tipoMedia, setTipoMedia] = useState("ANTIDESLIZANTE");
  const [talle, setTalle] = useState(TALLES[0]);
  const [cantidad, setCantidad] = useState(1);
  const [precioManual, setPrecioManual] = useState(15000);

  const [carrito, setCarrito] = useState([]);
  const [entregaTotal, setEntregaTotal] = useState(0);

  const [filtroNombre, setFiltroNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const snapJ = await getDocs(query(collection(db, "JUGADORES"), orderBy("APELLIDO", "asc")));
      setJugadores(snapJ.docs.map(d => ({ id: d.id, ...d.data() })));
      const snapV = await getDocs(query(collection(db, "VENTA_MEDIAS"), orderBy("fecha", "desc")));
      setVentas(snapV.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const agregarAlCarrito = () => {
    const nuevoItem = {
      id: Date.now(),
      tipo: tipoMedia,
      talle: talle,
      cantidad: Number(cantidad),
      precioUnitario: Number(precioManual),
      subtotal: Number(cantidad) * Number(precioManual)
    };
    setCarrito([...carrito, nuevoItem]);
    setCantidad(1);
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const totalCompra = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const guardarVentaFinal = async () => {
    if (!pibeSeleccionado || carrito.length === 0) return alert("Cargá al menos un producto");
    setCargando(true);

    try {
      const saldoFinal = totalCompra - entregaTotal;
      const ventaData = {
        jugadorId: pibeSeleccionado.DNI,
        nombre: `${pibeSeleccionado.APELLIDO} ${pibeSeleccionado.NOMBRE}`,
        categoria: pibeSeleccionado.CATEGORIA || "S/D",
        items: carrito,
        total: totalCompra,
        pagado: Number(entregaTotal),
        saldo: saldoFinal,
        fecha: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "VENTA_MEDIAS"), ventaData);
      setVentas([{ id: docRef.id, ...ventaData, fecha: { toDate: () => new Date() } }, ...ventas]);
      
      setPibeSeleccionado(null);
      setBusquedaPibe("");
      setCarrito([]);
      setEntregaTotal(0);
      alert("¡Venta completa registrada!");
    } catch (e) { 
      console.error(e); 
    } finally { 
      setCargando(false); 
    }
  };

  const eliminarVenta = async (e, id) => {
    e.stopPropagation(); // Evita que se abra la ficha al querer borrar
    if (window.confirm("¿Borrar esta venta del historial?")) {
      await deleteDoc(doc(db, "VENTA_MEDIAS", id));
      setVentas(ventas.filter(v => v.id !== id));
    }
  };

  const toggleFicha = (id) => {
    setIdVentaAbierta(idVentaAbierta === id ? null : id);
  };

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "100px" }}>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        
        <button onClick={() => navigate(-1)} style={styles.btnAtras}>← VOLVER</button>
        <h2 style={styles.titulo}>VENTA INDUMENTARIA</h2>

        {/* --- SECCIÓN DE CARGA (IGUAL A LA TUYA) --- */}
        <div style={styles.card}>
          <p style={styles.label}>JUGADOR</p>
          {!pibeSeleccionado ? (
            <>
              <input placeholder="Buscar por apellido..." value={busquedaPibe} onChange={e => setBusquedaPibe(e.target.value)} style={styles.input} />
              {busquedaPibe && (
                <div style={styles.sugerencias}>
                  {jugadores.filter(j => j.APELLIDO.toLowerCase().includes(busquedaPibe.toLowerCase())).slice(0, 5).map(j => (
                    <div key={j.DNI} onClick={() => setPibeSeleccionado(j)} style={styles.sugItem}>
                      {j.APELLIDO} {j.NOMBRE}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.pibeElegido}>
              <span>{pibeSeleccionado.APELLIDO} {pibeSeleccionado.NOMBRE}</span>
              <button onClick={() => {setPibeSeleccionado(null); setCarrito([])}} style={{color: "#FF453A", background: "none", border: "none", fontWeight: "bold"}}>CAMBIAR</button>
            </div>
          )}

          {pibeSeleccionado && (
            <div style={{ marginTop: "15px", borderTop: "1px solid #333", paddingTop: "15px" }}>
              <p style={styles.label}>2. AGREGAR PRODUCTO</p>
              <select value={tipoMedia} onChange={e => setTipoMedia(e.target.value)} style={styles.input}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select value={talle} onChange={e => setTalle(e.target.value)} style={styles.input}>
                {TALLES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <div style={{ display: "flex", gap: "10px" }}>
                <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} style={styles.input} placeholder="Cant" />
                <input type="number" value={precioManual} onChange={e => setPrecioManual(e.target.value)} style={styles.input} placeholder="Precio Unit." />
              </div>
              
              <button onClick={agregarAlCarrito} style={styles.btnAgregar}>+ AGREGAR AL CARRITO</button>

              {carrito.length > 0 && (
                <div style={styles.resumenCarrito}>
                  {carrito.map(item => (
                    <div key={item.id} style={styles.itemCarrito}>
                      <span>{item.cantidad}x {item.tipo} ({item.talle})</span>
                      <button onClick={() => quitarDelCarrito(item.id)} style={{background: "none", border: "none", color: "#FF453A"}}>✕</button>
                    </div>
                  ))}
                  <div style={styles.totalCaja}>
                    <p>TOTAL COMPRA: ${totalCompra}</p>
                    <div style={{marginTop: "10px"}}>
                      <label style={styles.label}>¿CUÁNTO ENTREGA HOY?</label>
                      <input type="number" value={entregaTotal} onChange={e => setEntregaTotal(e.target.value)} style={styles.input} placeholder="Monto entregado..." />
                    </div>
                    <button onClick={guardarVentaFinal} disabled={cargando} style={styles.btnFinalizar}>
                      {cargando ? "GUARDANDO..." : "CONFIRMAR VENTA FINAL"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- HISTORIAL CON DETALLE DESPLEGABLE --- */}
        <h3 style={{ marginTop: "40px", fontSize: "12px", color: "#666", letterSpacing: "1px" }}>HISTORIAL</h3>
        <input placeholder="Buscar en historial..." value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} style={{ ...styles.input, marginBottom: "15px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {ventas.filter(v => v.nombre.toLowerCase().includes(filtroNombre.toLowerCase())).map(v => (
            <div key={v.id} style={{ display: "flex", flexDirection: "column" }}>
              {/* Cabecera de la ficha */}
              <div onClick={() => toggleFicha(v.id)} style={{...styles.itemHistorial, borderBottom: idVentaAbierta === v.id ? "none" : "1px solid #222", borderRadius: idVentaAbierta === v.id ? "15px 15px 0 0" : "15px"}}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{v.nombre}</p>
                  <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>
                    {v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString() : "Reciente"}
                  </p>
                </div>
                <div style={{ textAlign: "right", marginRight: "12px" }}>
                  <p style={{ margin: 0, fontWeight: "900", fontSize: "14px", color: v.saldo <= 0 ? "#4CD964" : "#FF9500" }}>
                    {v.saldo <= 0 ? "PAGADO" : `$${v.saldo}`}
                  </p>
                </div>
                <button onClick={(e) => eliminarVenta(e, v.id)} style={styles.btnBorrar}>🗑️</button>
              </div>

              {/* Detalle Desplegable (Ticket) */}
              {idVentaAbierta === v.id && (
                <div style={styles.fichaDetalle}>
                  <p style={styles.ticketTitulo}>DETALLE DE LA VENTA</p>
                  <div style={styles.ticketRow}>
                    <span>Fecha:</span>
                    <span>{v.fecha?.toDate().toLocaleString()}</span>
                  </div>
                  <div style={styles.lineaTicket}></div>
                  {v.items?.map((it, idx) => (
                    <div key={idx} style={styles.ticketItem}>
                      <p style={{margin: 0}}>{it.cantidad}x {it.tipo}</p>
                      <p style={{margin: 0, fontSize: "11px", color: "#888"}}>{it.talle}</p>
                      <p style={{margin: 0, textAlign: "right"}}>${it.subtotal}</p>
                    </div>
                  ))}
                  <div style={styles.lineaTicket}></div>
                  <div style={styles.ticketRow}>
                    <span>TOTAL COMPRA:</span>
                    <span>${v.total}</span>
                  </div>
                  <div style={{...styles.ticketRow, color: "#4CD964"}}>
                    <span>PAGADO:</span>
                    <span>${v.pagado}</span>
                  </div>
                  <div style={{...styles.ticketRow, color: v.saldo > 0 ? "#FF9500" : "#4CD964", fontWeight: "bold"}}>
                    <span>{v.saldo > 0 ? "SALDO PENDIENTE:" : "ESTADO:"}</span>
                    <span>{v.saldo > 0 ? `$${v.saldo}` : "PAGADO COMPLETO"}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  // ... tus estilos anteriores se mantienen igual
  btnAtras: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px 15px", borderRadius: "10px", marginBottom: "20px", cursor: "pointer", fontSize: "11px", fontWeight: "bold" },
  titulo: { textAlign: "center", color: "#ffffff", fontWeight: "900", fontSize: "22px", marginBottom: "20px" },
  card: { background: "#1e1e1e", padding: "20px", borderRadius: "20px", border: "1px solid #2e2e2e" },
  input: { background: "#111", border: "1px solid #333", color: "#fff", padding: "12px", borderRadius: "10px", width: "100%", boxSizing: "border-box", outline: "none", marginBottom: "8px" },
  label: { fontSize: "10px", color: "#888", marginBottom: "8px", fontWeight: "bold", letterSpacing: "1px" },
  sugerencias: { background: "#222", borderRadius: "10px", overflow: "hidden", marginBottom: "10px" },
  sugItem: { padding: "12px", borderBottom: "1px solid #333", cursor: "pointer" },
  pibeElegido: { background: "#0A84FF22", padding: "12px", borderRadius: "12px", border: "1px solid #0A84FF", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" },
  btnAgregar: { background: "#fff", color: "#000", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", width: "100%", cursor: "pointer", marginTop: "5px" },
  resumenCarrito: { marginTop: "20px", background: "#111", padding: "15px", borderRadius: "15px" },
  itemCarrito: { display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #222" },
  totalCaja: { marginTop: "15px", paddingTop: "15px", borderTop: "2px dashed #333" },
  btnFinalizar: { background: "#34C759", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "900", width: "100%", marginTop: "15px", cursor: "pointer" },
  itemHistorial: { background: "#1e1e1e", padding: "15px", borderRadius: "15px", display: "flex", alignItems: "center", border: "1px solid #222", cursor: "pointer" },
  btnBorrar: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },

  // NUEVOS ESTILOS PARA LA FICHA DETALLE
  fichaDetalle: { background: "#161616", padding: "20px", borderRadius: "0 0 15px 15px", border: "1px solid #222", borderTop: "none", marginBottom: "10px" },
  ticketTitulo: { fontSize: "10px", color: "#33b5e5", fontWeight: "bold", marginBottom: "15px", textAlign: "center", letterSpacing: "2px" },
  ticketRow: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" },
  lineaTicket: { height: "1px", background: "#333", margin: "10px 0", borderBottom: "1px dashed #444" },
  ticketItem: { background: "#111", padding: "10px", borderRadius: "8px", marginBottom: "5px", fontSize: "13px" }
};