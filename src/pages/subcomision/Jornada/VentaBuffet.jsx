import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

// 1. MAPEAMOS LOS ICONOS (Agregué los nuevos que pediste)
const iconMap = {
  "CHORIPAN": "🌭", "HAMBURGUESA": "🍔", "GASEOSA": "🥤",
  "AGUA MINERAL": "💧", "GATORADE": "⚡", "AGUA SABORIZADA": "🍹",
  "AGUA CALIENTE": "🔥", "GIRASOL": "🌻", "ALFAJORES": "🍪",
  "OBLEAS": "🧇", "TURRONES": "🍬", "PAPAS": "🍟",
  "MASITAS": "🥐", "VASO HIELO": "🧊"
};

// 2. DEFINIMOS EL ORDEN CRÍTICO (Tal cual lo pediste)
const ORDEN_DESEADO = [
  "CHORIPAN", "HAMBURGUESA", "GASEOSA", "AGUA MINERAL", 
  "GATORADE", "AGUA SABORIZADA", "AGUA CALIENTE", "GIRASOL", 
  "ALFAJORES", "OBLEAS", "TURRONES", "PAPAS", "MASITAS", "VASO HIELO"
];

export default function VentaBuffet() {
  const [productos, setProductos] = useState([]);
  const [pedido, setPedido] = useState({});
  const [total, setTotal] = useState(0);
  const [responsable, setResponsable] = useState("");
  const [categoria, setCategoria] = useState("");

  const fechaHoy = new Date().toLocaleDateString('es-AR');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos_buffet"), (snap) => {
      const listaCargada = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // ORDENAMOS LA LISTA SEGÚN NUESTRO ARRAY
      const listaOrdenada = listaCargada.sort((a, b) => {
        return ORDEN_DESEADO.indexOf(a.nombre.toUpperCase()) - ORDEN_DESEADO.indexOf(b.nombre.toUpperCase());
      });

      setProductos(listaOrdenada);
    });
    return () => unsub();
  }, []);

  const cambiarCantidad = (id, precio, delta) => {
    const actual = pedido[id] || 0;
    const nueva = Math.max(0, actual + delta);
    setPedido({ ...pedido, [id]: nueva });
    setTotal(prev => prev + (delta * precio));
  };

  const finalizarVenta = async () => {
    if (total === 0) return alert("El pedido está vacío");
    if (!responsable || !categoria) return alert("Completá Responsable y Categoría");

    const detalle = productos
      .filter(p => pedido[p.id] > 0)
      .map(p => ({ nombre: p.nombre, cantidad: pedido[p.id], subtotal: p.precio * pedido[p.id] }));

    try {
      await addDoc(collection(db, "ventas_buffet_diarias"), {
        items: detalle,
        total,
        responsable: responsable.toUpperCase(),
        categoria: categoria.toUpperCase(),
        fecha: serverTimestamp()
      });
      alert("✅ Venta Guardada");
      setPedido({}); setTotal(0);
    } catch { alert("Error al guardar"); }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.headerOficial}>
          <div style={styles.topSection}>
              <img src="/images/unionas_escudo.png" alt="Escudo" style={styles.escudoCentro} />
              <h1 style={styles.jornadaTitle}>JORNADA</h1>
              <span style={styles.fechaTxt}>{fechaHoy}</span>
          </div>
          <div style={styles.inputsRow}>
              <input style={styles.inputFino} placeholder="CATEGORÍA" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
              <input style={styles.inputFino} placeholder="RESPONSABLE" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
          </div>
          <div style={styles.lineaBlanca}></div>
      </div>

      <div style={styles.layout}>
        {/* LISTA DE PRODUCTOS ORDENADA */}
        <div style={styles.listaSeccion}>
          {productos.map(p => (
            <div key={p.id} style={styles.filaProducto}>
              <div style={styles.infoProd}>
                <span style={styles.emojiIcon}>{iconMap[p.nombre.toUpperCase()] || "🍴"}</span>
                <div>
                    <div style={styles.nombre}>{p.nombre}</div>
                    <div style={styles.precio}>${p.precio}</div>
                </div>
              </div>

              <div style={styles.controles}>
                <button onClick={() => cambiarCantidad(p.id, p.precio, -1)} style={styles.btnMenos}>-</button>
                <span style={styles.cantidadNum}>{pedido[p.id] || 0}</span>
                <button onClick={() => cambiarCantidad(p.id, p.precio, 1)} style={styles.btnMas}>+</button>
              </div>
            </div>
          ))}
        </div>

        {/* RESUMEN LATERAL */}
        <div style={styles.resumenSeccion}>
          <div style={styles.resumenCard}>
            <div style={styles.resumenHeader}>DETALLE ACTUAL</div>
            <div style={styles.resumenBody}>
              {productos.filter(p => pedido[p.id] > 0).map(p => (
                <div key={p.id} style={styles.itemResumen}>
                  <span>{pedido[p.id]}x {p.nombre}</span>
                  <span>${p.precio * pedido[p.id]}</span>
                </div>
              ))}
              {total === 0 && <p style={styles.vacioTxt}>Esperando pedido...</p>}
            </div>
            <div style={styles.resumenFooter}>
              <div style={styles.totalFila}>
                <span>TOTAL:</span>
                <span>${total}</span>
              </div>
              <button 
                onClick={finalizarVenta} 
                style={{...styles.btnConfirmar, opacity: total > 0 ? 1 : 0.5}}
                disabled={total === 0}
              >
                COBRAR
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

const styles = {
  page: { background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" },
  headerOficial: { padding: "20px 16px 10px 16px", textAlign: "center" },
  topSection: { display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" },
  escudoCentro: { width: "40px", height: "40px", marginBottom: "5px" },
  jornadaTitle: { fontSize: "26px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "2px" },
  fechaTxt: { fontSize: "14px", color: "#888", fontWeight: "bold" },
  inputsRow: { display: "flex", gap: "10px", marginTop: "10px" },
  inputFino: { flex: 1, background: "#111", border: "1px solid #333", padding: "10px", borderRadius: "8px", color: "#fff", fontSize: "11px", textAlign: "center" },
  lineaBlanca: { height: "4px", background: "#fff", width: "100%", marginTop: "10px", borderRadius: "2px" },
  layout: { display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", maxWidth: "1000px", margin: "0 auto" },
  listaSeccion: { flex: "1 1 400px" },
  filaProducto: { background: "#161616", padding: "15px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #222", marginBottom: "10px" },
  infoProd: { display: "flex", alignItems: "center", gap: "15px" },
  emojiIcon: { fontSize: "28px" },
  nombre: { fontSize: "15px", fontWeight: "900" },
  precio: { fontSize: "14px", color: "#33b5e5", fontWeight: "bold" },
  controles: { display: "flex", alignItems: "center", gap: "15px" },
  btnMenos: { background: "#222", color: "#fff", border: "1px solid #444", width: "45px", height: "45px", borderRadius: "12px", fontSize: "20px", fontWeight: "bold" },
  btnMas: { background: "#33b5e5", color: "#fff", border: "none", width: "45px", height: "45px", borderRadius: "12px", fontSize: "20px", fontWeight: "bold" },
  cantidadNum: { minWidth: "25px", textAlign: "center", fontSize: "18px", fontWeight: "900" },
  resumenSeccion: { flex: "1 1 250px" },
  resumenCard: { background: "#111", borderRadius: "15px", border: "1px solid #33b5e5", position: "sticky", top: "20px", overflow: "hidden" },
  resumenHeader: { background: "#33b5e5", color: "#000", padding: "10px", fontWeight: "900", textAlign: "center", fontSize: "12px" },
  resumenBody: { padding: "15px", maxHeight: "300px", overflowY: "auto" },
  itemResumen: { display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "8px", borderBottom: "1px solid #222", paddingBottom: "4px" },
  vacioTxt: { textAlign: "center", color: "#444", fontSize: "12px" },
  resumenFooter: { padding: "15px", background: "#161616", borderTop: "1px solid #222" },
  totalFila: { display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "900", marginBottom: "15px" },
  btnConfirmar: { width: "100%", background: "#fff", color: "#000", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "900", cursor: "pointer" }
};