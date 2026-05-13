import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

const TALLES = ["CHICAS (talle 30)", "MEDIANAS (talle 37)", "GRANDES (talle 40)", "EXTRA GRANDE (talle +40)"];
const TIPOS = ["ANTIDESLIZANTE", "PANTORRILLERA", "MEDIA ENTERA", "SHORT", "CAMISETA"];

export default function VentaMedias() {
  const [jugadores, setJugadores] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [busquedaPibe, setBusquedaPibe] = useState("");
  const [pibeSeleccionado, setPibeSeleccionado] = useState(null);
  const [idVentaAbierta, setIdVentaAbierta] = useState(null);
  const [verPedido, setVerPedido] = useState(false);

  const [tipoMedia, setTipoMedia] = useState(TIPOS[0]);
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
      try {
        const snapJ = await getDocs(query(collection(db, "JUGADORES"), orderBy("APELLIDO", "asc")));
        setJugadores(snapJ.docs.map(d => ({ id: d.id, ...d.data() })));
        const snapV = await getDocs(query(collection(db, "VENTA_MEDIAS"), orderBy("fecha", "desc")));
        setVentas(snapV.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Error al cargar:", e); }
    };
    fetchData();
  }, []);

  // --- 📥 FUNCIÓN PARA DESCARGAR EL EXCEL ---
  const descargarExcel = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Encabezados (usamos punto y coma para que Excel en español lo separe bien)
    csvContent += "JUGADOR;PEDIDO;TOTAL;PAGADO;SALDO (DEUDA);FECHA\n";

    ventas.forEach(v => {
      const detalle = v.items?.map(it => `${it.cantidad}x ${it.tipo}`).join(" - ");
      const fecha = v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString() : "Hoy";
      // Limpiamos comas por las dudas para no romper el formato
      const fila = `${v.nombre};${detalle};${v.total};${v.pagado};${v.saldo};${fecha}\n`;
      csvContent += fila;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Planilla_Deudas_Indumentaria.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 📝 LÓGICA PARA AGRUPAR EL PEDIDO ---
  const generarResumenPedido = () => {
    const resumen = {};
    ventas.forEach(venta => {
      venta.items?.forEach(item => {
        const clave = `${item.tipo}-${item.talle}`;
        if (!resumen[clave]) {
          resumen[clave] = { tipo: item.tipo, talle: item.talle, cantidadTotal: 0 };
        }
        resumen[clave].cantidadTotal += Number(item.cantidad);
      });
    });
    return Object.values(resumen).sort((a, b) => a.tipo.localeCompare(b.tipo));
  };

  const listaPedido = generarResumenPedido();

  // --- 💰 CÁLCULOS DE BALANCE ---
  const totalPagadoGlobal = ventas.reduce((acc, v) => acc + (Number(v.pagado) || 0), 0);
  const totalDeudaGlobal = ventas.reduce((acc, v) => acc + (Number(v.saldo) || 0), 0);
  const totalCompraActual = carrito.reduce((acc, item) => acc + item.subtotal, 0);

  const agregarAlCarrito = () => {
    const nuevoItem = {
      id: Date.now(), tipo: tipoMedia, talle: talle,
      cantidad: Number(cantidad), precioUnitario: Number(precioManual),
      subtotal: Number(cantidad) * Number(precioManual)
    };
    setCarrito([...carrito, nuevoItem]);
    setCantidad(1);
  };

  const quitarDelCarrito = (id) => setCarrito(carrito.filter(item => item.id !== id));

  const guardarVentaFinal = async () => {
    if (!pibeSeleccionado || carrito.length === 0) return alert("Cargá productos");
    setCargando(true);
    try {
      const pagadoHoy = Number(entregaTotal) || 0;
      const saldoFinal = totalCompraActual - pagadoHoy;
      const ventaData = {
        jugadorId: pibeSeleccionado.DNI,
        nombre: `${pibeSeleccionado.APELLIDO} ${pibeSeleccionado.NOMBRE}`,
        items: carrito,
        total: totalCompraActual,
        pagado: pagadoHoy,
        saldo: saldoFinal,
        fecha: serverTimestamp(),
      };
      await addDoc(collection(db, "VENTA_MEDIAS"), ventaData);
      alert("¡Venta registrada!");
      window.location.reload(); 
    } catch { alert("Error al guardar"); } finally { setCargando(false); }
  };

  const eliminarVenta = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("¿Borrar esta venta?")) {
      await deleteDoc(doc(db, "VENTA_MEDIAS", id));
      setVentas(ventas.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ background: "#111", minHeight: "100vh", color: "white", paddingBottom: "100px" }}>
      <Navbar />
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        
        <button onClick={() => navigate(-1)} style={styles.btnAtras}>← VOLVER</button>
        <h2 style={styles.titulo}>VENTA INDUMENTARIA</h2>

        <div style={styles.panelBalance}>
          <div style={styles.colBalance}>
            <span style={styles.labelBalance}>DINERO EN CAJA</span>
            <span style={styles.montoPagado}>${totalPagadoGlobal.toLocaleString()}</span>
          </div>
          <div style={{ ...styles.colBalance, borderLeft: "1px solid #333" }}>
            <span style={styles.labelBalance}>DINERO QUE DEBEN</span>
            <span style={styles.montoDeuda}>${totalDeudaGlobal.toLocaleString()}</span>
          </div>
        </div>

        {/* --- FILA DE BOTONES DE ACCIÓN --- */}
        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
          <button 
            onClick={() => setVerPedido(!verPedido)} 
            style={{...styles.btnAgregar, background: verPedido ? "#FF9500" : "#0A84FF", color: "white", flex: 2}}
          >
            {verPedido ? "✕ CERRAR" : "📋 PEDIDO PROVEEDOR"}
          </button>

          <button 
            onClick={descargarExcel} 
            style={{...styles.btnAgregar, background: "#34C759", color: "white", flex: 1}}
          >
            EXCEL 📥
          </button>
        </div>

        {/* --- VISTA DE PEDIDO AGRUPADO --- */}
        {verPedido && (
          <div style={{...styles.card, marginTop: "20px", border: "2px solid #0A84FF"}}>
            <h3 style={{fontSize: "14px", textAlign: "center", color: "#0A84FF", marginBottom: "15px"}}>RESUMEN DE MERCADERÍA</h3>
            {listaPedido.length > 0 ? listaPedido.map((item, idx) => (
              <div key={idx} style={styles.itemPedido}>
                <div style={{flex: 1}}>
                  <p style={{margin: 0, fontWeight: "bold"}}>{item.tipo}</p>
                  <p style={{margin: 0, fontSize: "11px", color: "#888"}}>{item.talle}</p>
                </div>
                <div style={styles.badgeCantidad}>{item.cantidadTotal}u.</div>
              </div>
            )) : <p style={{textAlign: "center", fontSize: "12px"}}>No hay ventas para resumir.</p>}
          </div>
        )}

        {!verPedido && (
          <>
            <div style={{...styles.card, marginTop: "20px"}}>
              <p style={styles.label}>1. JUGADOR</p>
              {!pibeSeleccionado ? (
                <>
                  <input placeholder="Buscar por apellido..." value={busquedaPibe} onChange={e => setBusquedaPibe(e.target.value)} style={styles.input} />
                  {busquedaPibe && (
                    <div style={styles.sugerencias}>
                      {jugadores.filter(j => j.APELLIDO.toLowerCase().includes(busquedaPibe.toLowerCase())).map(j => (
                        <div key={j.DNI} onClick={() => setPibeSeleccionado(j)} style={styles.sugItem}>{j.APELLIDO} {j.NOMBRE}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={styles.pibeElegido}>
                  <span>{pibeSeleccionado.APELLIDO} {pibeSeleccionado.NOMBRE}</span>
                  <button onClick={() => setPibeSeleccionado(null)} style={{color: "#FF453A", background: "none", border: "none", fontWeight: "bold"}}>CAMBIAR</button>
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
                    <input type="number" value={precioManual} onChange={e => setPrecioManual(e.target.value)} style={styles.input} placeholder="Precio" />
                  </div>
                  <button onClick={agregarAlCarrito} style={styles.btnAgregar}>+ AGREGAR AL CARRITO</button>
                </div>
              )}
            </div>

            {carrito.length > 0 && (
              <div style={styles.resumenCarrito}>
                {carrito.map(item => (
                  <div key={item.id} style={styles.itemCarrito}>
                    <span>{item.cantidad}x {item.tipo} ({item.talle})</span>
                    <button onClick={() => quitarDelCarrito(item.id)} style={{background: "none", border: "none", color: "#FF453A"}}>✕</button>
                  </div>
                ))}
                <div style={styles.totalCaja}>
                  <p style={{fontWeight: "900", color: "#33b5e5", textAlign: "right"}}>TOTAL: ${totalCompraActual}</p>
                  <label style={styles.label}>PAGA HOY ($):</label>
                  <input type="number" value={entregaTotal} onChange={e => setEntregaTotal(e.target.value)} style={styles.input} />
                  <button onClick={guardarVentaFinal} disabled={cargando} style={styles.btnFinalizar}>CONFIRMAR VENTA</button>
                </div>
              </div>
            )}

            <h3 style={{ marginTop: "40px", fontSize: "12px", color: "#666", letterSpacing: "1px" }}>HISTORIAL</h3>
            <input placeholder="Buscar en historial..." value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} style={{ ...styles.input, marginBottom: "15px" }} />

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {ventas.filter(v => v.nombre.toLowerCase().includes(filtroNombre.toLowerCase())).map(v => (
                <div key={v.id} style={{ display: "flex", flexDirection: "column" }}>
                  <div onClick={() => setIdVentaAbierta(idVentaAbierta === v.id ? null : v.id)} style={{...styles.itemHistorial, borderBottom: idVentaAbierta === v.id ? "none" : "1px solid #222", borderRadius: idVentaAbierta === v.id ? "15px 15px 0 0" : "15px"}}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{v.nombre}</p>
                      <p style={{ margin: 0, fontSize: "10px", color: "#555" }}>{v.fecha?.toDate ? v.fecha.toDate().toLocaleDateString() : "Hoy"}</p>
                    </div>
                    <div style={{ textAlign: "right", marginRight: "12px" }}>
                      <p style={{ margin: 0, fontWeight: "900", fontSize: "14px", color: (Number(v.saldo) || 0) <= 0 ? "#4CD964" : "#FF9500" }}>
                        {(Number(v.saldo) || 0) <= 0 ? "PAGADO" : `$${v.saldo}`}
                      </p>
                    </div>
                    <button onClick={(e) => eliminarVenta(e, v.id)} style={styles.btnBorrar}>🗑️</button>
                  </div>
                  {idVentaAbierta === v.id && (
                    <div style={styles.fichaDetalle}>
                      {v.items?.map((it, idx) => (
                        <div key={idx} style={styles.ticketItem}>
                          <p style={{margin: 0}}>{it.cantidad}x {it.tipo} ({it.talle})</p>
                          <p style={{margin: 0, textAlign: "right"}}>${it.subtotal}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  btnAtras: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "8px 15px", borderRadius: "10px", marginBottom: "20px", fontSize: "11px", fontWeight: "bold" },
  titulo: { textAlign: "center", color: "#ffffff", fontWeight: "900", fontSize: "22px", marginBottom: "20px" },
  card: { background: "#1e1e1e", padding: "20px", borderRadius: "20px", border: "1px solid #2e2e2e" },
  input: { background: "#111", border: "1px solid #333", color: "#fff", padding: "12px", borderRadius: "10px", width: "100%", boxSizing: "border-box", outline: "none", marginBottom: "8px" },
  label: { fontSize: "10px", color: "#888", marginBottom: "8px", fontWeight: "bold", letterSpacing: "1px" },
  sugerencias: { background: "#222", borderRadius: "10px", maxHeight: "220px", overflowY: "auto", marginBottom: "10px" },
  sugItem: { padding: "12px", borderBottom: "1px solid #333", cursor: "pointer" },
  pibeElegido: { background: "#0A84FF22", padding: "12px", borderRadius: "12px", border: "1px solid #0A84FF", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" },
  btnAgregar: { background: "#fff", color: "#000", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "bold", width: "100%", cursor: "pointer" },
  resumenCarrito: { marginTop: "20px", background: "#111", padding: "15px", borderRadius: "15px", border: "1px solid #222" },
  itemCarrito: { display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "8px 0", borderBottom: "1px solid #222" },
  totalCaja: { marginTop: "15px", paddingTop: "15px" },
  btnFinalizar: { background: "#34C759", color: "#fff", border: "none", padding: "15px", borderRadius: "12px", fontWeight: "900", width: "100%", marginTop: "15px", cursor: "pointer" },
  itemHistorial: { background: "#1e1e1e", padding: "15px", borderRadius: "15px", display: "flex", alignItems: "center", border: "1px solid #222", cursor: "pointer" },
  btnBorrar: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  panelBalance: { display: "flex", background: "#1e1e1e", borderRadius: "20px", padding: "20px", border: "1px solid #333" },
  colBalance: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
  labelBalance: { fontSize: "8px", color: "#888", fontWeight: "900", marginBottom: "5px" },
  montoPagado: { fontSize: "22px", fontWeight: "900", color: "#4CD964" },
  montoDeuda: { fontSize: "22px", fontWeight: "900", color: "#FF9500" },
  fichaDetalle: { background: "#161616", padding: "15px", borderRadius: "0 0 15px 15px", border: "1px solid #222", borderTop: "none", marginBottom: "10px" },
  ticketItem: { display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "5px" },
  itemPedido: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #333" },
  badgeCantidad: { background: "#0A84FF", color: "white", padding: "4px 10px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px" }
};