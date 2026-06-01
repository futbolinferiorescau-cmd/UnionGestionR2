import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom"; 
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

const iconMap = {
  "CHORIPAN": "🌭", "HAMBURGUESA": "🍔", "GASEOSA": "🥤",
  "AGUA MINERAL": "💧", "GATORADE": "⚡", "AGUA SABORIZADA": "🍹",
  "AGUA CALIENTE": "🔥", "GIRASOL": "🌻", "ALFAJORES": "🍪",
  "OBLEAS": "🧇", "TURRONES": "🍬", "PAPAS": "🍟",
  "MASITAS": "🥐", "VASO HIELO": "🧊"
};

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
  // --- ⚽ CAMBIAMOS CATEGORIA POR RIVAL ---
  const [rival, setRival] = useState("");
  const [fechaManual, setFechaManual] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos_buffet"), (snap) => {
      const listaCargada = snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
    if (!responsable || !rival) return alert("Completá Responsable y el Equipo Rival");

    const detalle = productos
      .filter(p => pedido[p.id] > 0)
      .map(p => ({ nombre: p.nombre, cantidad: pedido[p.id], subtotal: p.precio * pedido[p.id] }));

    try {
      const [anio, mes, dia] = fechaManual.split("-");
      const fechaFinal = new Date(Number(anio), Number(mes) - 1, Number(dia), 12, 0, 0);

      await addDoc(collection(db, "ventas_buffet_diarias"), {
        items: detalle,
        total,
        responsable: responsable.toUpperCase(),
        rival: rival.toUpperCase(), // Guardamos el nombre del rival en la base de datos
        fecha: fechaFinal 
      });
      setPedido({}); setTotal(0);
      alert("✅ Venta Guardada");
    } catch { alert("Error al guardar"); }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      
      <div style={styles.headerOficial}>
          <div style={styles.topSection}>
              <img src="/images/unionas_escudo.png" alt="Escudo" style={styles.escudoCentro} />
              <h1 style={styles.jornadaTitle}>BUFFET</h1>
          </div>
          
          <div style={styles.inputsRow}>
              {/* --- 📅 SELECTOR DE FECHA CON LETRA MÁS GRANDE --- */}
              <input 
                type="date" 
                style={styles.inputFechaGrande} 
                value={fechaManual} 
                onChange={(e) => setFechaManual(e.target.value)} 
              />
              {/* --- ⚽ NUEVO INPUT PARA EL EQUIPO RIVAL --- */}
              <input style={styles.inputFino} placeholder="RIVAL / EQUIPO" value={rival} onChange={(e) => setRival(e.target.value)} />
              <input style={styles.inputFino} placeholder="RESPONSABLE" value={responsable} onChange={(e) => setResponsable(e.target.value)} />
          </div>
          <div style={styles.lineaBlanca}></div>
      </div>

      <div style={styles.layout}>
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

        <div style={styles.resumenSeccion}>
          <div style={styles.resumenCard}>
            <div style={styles.resumenHeader}>PEDIDO ACTUAL</div>
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
              <button onClick={finalizarVenta} style={{...styles.btnConfirmar, opacity: total > 0 ? 1 : 0.5}} disabled={total === 0}>
                COBRAR
              </button>
            </div>
          </div>
          
          <button onClick={() => navigate("/subcomision/jornada/buffet-detalle")} style={styles.btnVerHistorial}>
            📄 VER DETALLE DE VENTAS
          </button>
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
  escudoCentro: { width: "45px", height: "45px", marginBottom: "5px" },
  jornadaTitle: { fontSize: "28px", fontWeight: "900", color: "#fff", margin: 0, letterSpacing: "2px" },
  inputsRow: { display: "flex", gap: "10px", marginTop: "15px", alignItems: "center" },
  inputFino: { flex: 1, background: "#111", border: "1px solid #333", padding: "12px", borderRadius: "10px", color: "#fff", fontSize: "13px", textAlign: "center" },
  // --- ESTILO NUEVO PARA LA FECHA GRANDE ---
  inputFechaGrande: { flex: 1, background: "#111", border: "1px solid #333", padding: "10px", borderRadius: "10px", color: "#fff", fontSize: "16px", fontWeight: "bold", textAlign: "center", colorScheme: "dark" },
  lineaBlanca: { height: "4px", background: "#fff", width: "100%", marginTop: "15px", borderRadius: "2px" },
  layout: { display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", maxWidth: "1200px", margin: "0 auto" },
  listaSeccion: { flex: "1 1 500px" },
  filaProducto: { background: "#161616", padding: "20px", borderRadius: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid #222", marginBottom: "12px" },
  infoProd: { display: "flex", alignItems: "center", gap: "20px" },
  emojiIcon: { fontSize: "36px" },
  nombre: { fontSize: "18px", fontWeight: "900", textTransform: "uppercase" },
  precio: { fontSize: "18px", color: "#33b5e5", fontWeight: "bold" },
  controles: { display: "flex", alignItems: "center", gap: "25px" },
  btnMenos: { background: "#222", color: "#fff", border: "1px solid #444", width: "70px", height: "70px", borderRadius: "18px", fontSize: "32px", fontWeight: "bold" },
  btnMas: { background: "#33b5e5", color: "#fff", border: "none", width: "70px", height: "70px", borderRadius: "18px", fontSize: "32px", fontWeight: "bold" },
  cantidadNum: { minWidth: "40px", textAlign: "center", fontSize: "24px", fontWeight: "900" },
  resumenSeccion: { flex: "1 1 300px" },
  resumenCard: { background: "#111", borderRadius: "20px", border: "1px solid #33b5e5", overflow: "hidden", position: "sticky", top: "20px" },
  resumenHeader: { background: "#33b5e5", color: "#000", padding: "12px", fontWeight: "900", textAlign: "center", fontSize: "13px" },
  resumenBody: { padding: "20px", maxHeight: "400px", overflowY: "auto" },
  itemResumen: { display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px", borderBottom: "1px solid #222", paddingBottom: "6px" },
  vacioTxt: { textAlign: "center", color: "#444", fontSize: "13px", padding: "20px" },
  resumenFooter: { padding: "20px", background: "#161616", borderTop: "1px solid #222" },
  totalFila: { display: "flex", justifyContent: "space-between", fontSize: "22px", fontWeight: "900", marginBottom: "20px" },
  btnConfirmar: { width: "100%", background: "#fff", color: "#000", border: "none", padding: "20px", borderRadius: "15px", fontWeight: "900", cursor: "pointer", fontSize: "18px" },
  btnVerHistorial: { width: "100%", marginTop: "25px", background: "#111", border: "1px solid #333", color: "#33b5e5", padding: "18px", borderRadius: "15px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }
};