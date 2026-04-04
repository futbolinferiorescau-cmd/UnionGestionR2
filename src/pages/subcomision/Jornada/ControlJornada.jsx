import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  getDocs, 
  deleteDoc, // <--- Agregado para limpiar
  doc,       // <--- Agregado para limpiar
  serverTimestamp 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

export default function ControlJornada() {
  const navigate = useNavigate();
  const [responsable, setResponsable] = useState("");
  const [movimientos, setMovimientos] = useState([]);
  const [monto, setMonto] = useState("");
  const [categoria, setCategoria] = useState("ENTRADAS");
  const [totalBuffetReal, setTotalBuffetReal] = useState(0);
  const [cargando, setCargando] = useState(false); // <--- Para evitar doble clic

  const categorias = ["ENTRADAS", "GASTO ÁRBITROS", "COMPRA MERCADERÍA", "HIELO / CARBÓN", "OTROS GASTOS"];

  // 1. ESCUCHAR VENTAS DEL BUFFET EN TIEMPO REAL
  useEffect(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, "ventas_buffet_diarias"),
      where("fecha", ">=", hoy)
    );

    const unsub = onSnapshot(q, (snap) => {
      let suma = 0;
      snap.forEach(doc => {
        suma += doc.data().total || 0;
      });
      setTotalBuffetReal(suma);
    });

    return () => unsub();
  }, []);

  const agregarMovimiento = () => {
    if (!monto || monto <= 0) return alert("Ingresá un monto válido");
    const esGasto = categoria.includes("GASTO") || categoria.includes("COMPRA") || categoria.includes("HIELO");
    const nuevo = { tipo: esGasto ? "EGRESO" : "INGRESO", categoria, monto: Number(monto) };
    setMovimientos([nuevo, ...movimientos]);
    setMonto("");
  };

  const totalIngresosManuales = movimientos.reduce((acc, mov) => mov.tipo === "INGRESO" ? acc + mov.monto : acc, 0);
  const totalEgresos = movimientos.reduce((acc, mov) => mov.tipo === "EGRESO" ? acc + mov.monto : acc, 0);
  const balanceFinal = (totalIngresosManuales + totalBuffetReal) - totalEgresos;

  // 2. FUNCIÓN DE CIERRE DE JORNADA (CON LIMPIEZA PROFUNDA)
  const finalizarJornada = async () => {
    if (!responsable) return alert("Por favor, ingresá el nombre del Responsable");
    if (cargando) return;

    const confirmar = window.confirm("¿Cerrar jornada? Se archivará el total y el contador de Buffet volverá a $0.");

    if (confirmar) {
      setCargando(true);
      try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        // Buscamos todas las ventas de hoy para el resumen y para borrarlas después
        const ventasSnap = await getDocs(query(
          collection(db, "ventas_buffet_diarias"),
          where("fecha", ">=", hoy)
        ));

        const resumenProductos = {};
        const idsVentas = [];

        ventasSnap.forEach(docSnap => {
          idsVentas.push(docSnap.id);
          const items = docSnap.data().items || [];
          items.forEach(item => {
            resumenProductos[item.nombre] = (resumenProductos[item.nombre] || 0) + item.cantidad;
          });
        });

        // A. Guardamos el registro oficial en el Historial
        await addDoc(collection(db, "jornadas_registros"), {
          responsable: responsable.toUpperCase(),
          movimientos,
          recaudadoBuffet: totalBuffetReal,
          productosVendidos: resumenProductos, 
          balanceFinal: balanceFinal,
          fecha: serverTimestamp(),
          fechaTexto: new Date().toLocaleDateString('es-AR')
        });

        // B. LIMPIEZA: Borramos los tickets individuales para reiniciar el contador
        const borrarPromesas = idsVentas.map(id => deleteDoc(doc(db, "ventas_buffet_diarias", id)));
        await Promise.all(borrarPromesas);

        alert("✅ Jornada cerrada y contador reiniciado.");
        setMovimientos([]);
        setResponsable("");
        navigate("/subcomision/jornada");

      } catch (error) {
        console.error(error);
        alert("Error al cerrar la jornada.");
      } finally {
        setCargando(false);
      }
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.titulo}>BALANCE DE JORNADA 📊</h2>
        
        <input 
          placeholder="RESPONSABLE DE FECHA" 
          value={responsable} 
          onChange={e => setResponsable(e.target.value)} 
          style={styles.inputFull} 
        />

        <div style={styles.boxAuto}>
            <div style={{display: "flex", flexDirection: "column"}}>
                <span style={styles.labelAuto}>💰 RECAUDADO BUFFET</span>
                <small style={{color: "#33b5e5", fontSize: "9px"}}>Suma automática de hoy</small>
            </div>
            <span style={styles.montoAuto}>${totalBuffetReal}</span>
        </div>

        <div style={styles.cajaCarga}>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} style={styles.select}>
            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="$" type="number" value={monto} onChange={e => setMonto(e.target.value)} style={styles.inputMonto} />
          <button onClick={agregarMovimiento} style={styles.btnSumar}>+</button>
        </div>

        <div style={styles.planilla}>
          <div style={styles.headerPlanilla}>DETALLE DE OTROS MOVIMIENTOS</div>
          {movimientos.map((m, i) => (
            <div key={i} style={styles.fila}>
              <span style={{color: m.tipo === "INGRESO" ? "#16a34a" : "#ef4444", fontWeight: "900", fontSize: "10px"}}>
                {m.tipo === "INGRESO" ? "▲ INGRESO" : "▼ EGRESO"}
              </span>
              <span style={{flex: 2, fontSize: "13px", marginLeft: "10px"}}>{m.categoria}</span>
              <span style={{fontWeight: "900"}}>${m.monto}</span>
            </div>
          ))}
          {movimientos.length === 0 && <p style={styles.vacio}>Sin movimientos manuales todavía</p>}
        </div>

        <div style={styles.boxBalance}>
          <span style={{fontSize: "12px", color: "#888", fontWeight: "bold"}}>EFECTIVO TOTAL:</span>
          <span style={{color: balanceFinal >= 0 ? "#33b5e5" : "#ef4444"}}>${balanceFinal}</span>
        </div>

        <button 
          onClick={finalizarJornada} 
          style={{...styles.btnFinalizar, opacity: cargando ? 0.5 : 1}}
          disabled={cargando}
        >
          {cargando ? "GUARDANDO..." : "CERRAR Y ARCHIVAR JORNADA"}
        </button>
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  page: { background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" },
  container: { padding: "16px", maxWidth: "600px", margin: "0 auto" },
  titulo: { color: "#33b5e5", fontSize: "18px", textAlign: "center", fontWeight: "900", marginBottom: "15px" },
  inputFull: { width: "100%", background: "#111", border: "1px solid #333", padding: "14px", color: "#fff", borderRadius: "10px", marginBottom: "15px", outline: "none" },
  boxAuto: { background: "rgba(51, 181, 229, 0.05)", border: "1px solid #33b5e5", padding: "18px", borderRadius: "15px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" },
  labelAuto: { fontSize: "12px", fontWeight: "900", color: "#33b5e5" },
  montoAuto: { fontSize: "22px", fontWeight: "900", color: "#fff" },
  cajaCarga: { display: "flex", gap: "8px", marginBottom: "20px" },
  select: { flex: 2, background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "10px", padding: "12px", fontSize: "12px" },
  inputMonto: { flex: 1, background: "#111", color: "#fff", border: "1px solid #333", borderRadius: "10px", padding: "12px", textAlign: "center" },
  btnSumar: { background: "#33b5e5", color: "#fff", border: "none", borderRadius: "10px", width: "55px", fontWeight: "900", fontSize: "24px" },
  planilla: { background: "#111", borderRadius: "15px", padding: "15px", minHeight: "100px", border: "1px solid #222" },
  headerPlanilla: { fontSize: "10px", color: "#444", fontWeight: "900", marginBottom: "10px", borderBottom: "1px solid #222", paddingBottom: "5px" },
  fila: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #222", alignItems: "center" },
  boxBalance: { display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 0", gap: "5px" },
  btnFinalizar: { width: "100%", background: "#fff", color: "#000", border: "none", padding: "18px", borderRadius: "12px", fontWeight: "900", fontSize: "14px" },
  vacio: { textAlign: "center", padding: "20px", color: "#333", fontSize: "12px" }
};