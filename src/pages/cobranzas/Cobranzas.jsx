import React, { useState, useEffect, useCallback } from "react";
import { db, storage } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore"; 
import { ref, getDownloadURL } from "firebase/storage"; 
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

export default function Cobranzas() {
  const [listaJugadores, setListaJugadores] = useState([]);
  const [asistenciasAnuales, setAsistenciasAnuales] = useState([]);
  const [pagosAnuales, setPagosAnuales] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [fotoUrlSeleccionada, setFotoUrlSeleccionada] = useState("");

  const mesesCiclo = [
    { id: "02", nombre: "FEBRERO" }, { id: "03", nombre: "MARZO" },
    { id: "04", nombre: "ABRIL" }, { id: "05", nombre: "MAYO" },
    { id: "06", nombre: "JUNIO" }, { id: "07", nombre: "JULIO" },
    { id: "08", nombre: "AGOSTO" }, { id: "09", nombre: "SEPTIEMBRE" },
    { id: "10", nombre: "OCTUBRE" }, { id: "11", nombre: "NOVIEMBRE" },
    { id: "12", nombre: "DICIEMBRE" }
  ];

  // --- FUNCIONES DE APOYO (HELPER FUNCTIONS) ---

  const normalizarTexto = (texto) => {
    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quita acentos
      .replace(/[^a-z0-9]/g, "")      // Quita símbolos/espacios
      .trim();
  };

  const obtenerAnioNacimiento = (fechaStr) => {
    if (!fechaStr) return "";
    const match = fechaStr.match(/\d{4}/);
    return match ? match[0] : "";
  };

  const parsearFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const unificada = fechaStr.replace(/\//g, "-");
    const partes = unificada.split("-");
    if (partes.length < 2) return null;
    return {
      dia: parseInt(partes[0]),
      mes: parseInt(partes[1]),
      anio: partes[2] ? parseInt(partes[2]) : 2026
    };
  };

  // --- CARGA DE DATOS ---

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [jugSnap, asisSnap, pagosSnap] = await Promise.all([
        getDocs(collection(db, "JUGADORES")),
        getDocs(collection(db, "ASISTENCIAS")),
        getDocs(collection(db, "pagos_plus"))
      ]);

      setListaJugadores(jugSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAsistenciasAnuales(asisSnap.docs.map(doc => doc.data()));
      setPagosAnuales(pagosSnap.docs.map(doc => doc.data()));
    } catch (err) {
      console.error("Error cargando Firebase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  // --- LÓGICA DE INTERFAZ ---

  const abrirFicha = async (jugador) => {
    setJugadorSeleccionado(jugador);
    setFotoUrlSeleccionada("");
    const dni = String(jugador.DNI || "").trim();
    let urlEncontrada = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    
    if (dni) {
      const extensiones = [".jpg", ".JPG", ".png", ".jpeg"];
      for (const ext of extensiones) {
        try {
          const url = await getDownloadURL(ref(storage, `fotos_jugadores/${dni}${ext}`));
          urlEncontrada = url;
          break;
        } catch { continue; }
      }
    }
    setFotoUrlSeleccionada(urlEncontrada);
  };

  const calcularResumenAnual = (jugador) => {
    const nombrePibe = normalizarTexto(jugador.NOMBRE);
    const apellidoPibe = normalizarTexto(jugador.APELLIDO);
    const anioCat = obtenerAnioNacimiento(jugador["FECHA NACIMIENTO"]);
    const dniJug = String(jugador.DNI || "").trim();

    return mesesCiclo.map(m => {
      const mesNum = parseInt(m.id);

      // 1. Filtrar entrenamientos por Mes y Categoría (Año de nacimiento)
      const entrenamientosMes = asistenciasAnuales.filter(asis => {
        const f = parsearFecha(asis.fecha);
        const catAsis = normalizarTexto(asis.categoria);
        return f && f.mes === mesNum && f.anio === 2026 && catAsis.includes(anioCat);
      });

      // 2. Contar presentes (Buscamos nombre y apellido en el doc de asistencia)
      const countAsis = entrenamientosMes.filter(asis => {
        const presentesRaw = [
          ...(asis.presentes || []),
          ...Object.values(asis).filter(v => typeof v === 'string' && v.length > 5 && v !== asis.fecha)
        ].map(p => normalizarTexto(p));

        return presentesRaw.some(p => p.includes(nombrePibe) && p.includes(apellidoPibe));
      }).length;

      const countAusentes = entrenamientosMes.length - countAsis;
      const pagado = pagosAnuales.some(p => String(p.dni || "").trim() === dniJug && p.mesAnio === `2026-${m.id}`);

      return { ...m, countAsis, countAusentes, pagado, total: entrenamientosMes.length };
    });
  };

  const filtrados = listaJugadores.filter(j => 
    normalizarTexto(`${j.NOMBRE} ${j.APELLIDO}`).includes(normalizarTexto(busqueda)) || 
    String(j.DNI).includes(busqueda)
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.titulo}>GESTIÓN DE COBRANZA</h1>
        <input 
          placeholder="Buscar por apellido o DNI..." 
          value={busqueda} 
          onChange={(e) => setBusqueda(e.target.value)} 
          style={styles.searchInput} 
        />

        {loading ? <p style={styles.info}>Cargando datos...</p> : (
          <div style={styles.grid}>
            {filtrados.map(jug => (
              <div key={jug.id} style={styles.fichaSimple} onClick={() => abrirFicha(jug)}>
                <div style={styles.datos}>
                    <p style={styles.nombreLista}>{jug.APELLIDO}, {jug.NOMBRE}</p>
                    <p style={styles.dniLista}>DNI: {jug.DNI} • CAT {obtenerAnioNacimiento(jug["FECHA NACIMIENTO"])}</p>
                </div>
                <div style={styles.badgeVer}>HISTORIAL</div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL DE DETALLE --- */}
        {jugadorSeleccionado && (
          <div style={styles.overlay} onClick={() => setJugadorSeleccionado(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setJugadorSeleccionado(null)}>✕</button>
              
              <div style={styles.modalHeader}>
                <div style={styles.marcoFoto}><img src={fotoUrlSeleccionada} style={styles.foto} alt="foto" /></div>
                <h2 style={styles.nombreModal}>{jugadorSeleccionado.NOMBRE} {jugadorSeleccionado.APELLIDO}</h2>
                <p style={styles.catModal}>CATEGORÍA {obtenerAnioNacimiento(jugadorSeleccionado["FECHA NACIMIENTO"])}</p>
                <p style={styles.dniModal}>DNI: {jugadorSeleccionado.DNI}</p>
              </div>

              <div style={styles.tabla}>
                <div style={styles.tablaHeader}>
                  <span style={{flex: 1}}>MES</span>
                  <span style={{flex: 2, textAlign: 'center'}}>PRES. | AUSENTES</span>
                  <span style={{flex: 1, textAlign: 'right'}}>PLUS</span>
                </div>
                {calcularResumenAnual(jugadorSeleccionado).map(res => (
                  <div key={res.id} style={styles.fila}>
                    <span style={styles.mesName}>{res.nombre}</span>
                    <span style={styles.asisResumen}>
                        <span style={{color: res.countAsis > 0 ? '#16a34a' : '#444'}}>{res.countAsis} ✅</span>
                        <span style={{color: '#222', margin: '0 8px'}}>|</span>
                        <span style={{color: res.countAusentes > 0 ? '#ef4444' : '#444'}}>{res.countAusentes} ❌</span>
                    </span>
                    <span style={res.pagado ? styles.ok : (res.total > 0 ? styles.deuda : styles.vacio)}>
                      {res.pagado ? "PAGADO" : (res.total > 0 ? "DEUDA" : "---")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

const styles = {
  page: { background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" },
  container: { padding: "16px", maxWidth: "500px", margin: "0 auto" },
  titulo: { fontSize: "18px", fontWeight: "900", textAlign: "center", marginBottom: "20px", textTransform: "uppercase" },
  searchInput: { width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "15px", borderRadius: "12px", marginBottom: "20px", outline: "none", boxSizing: "border-box" },
  grid: { display: "flex", flexDirection: "column", gap: "10px" },
  fichaSimple: { background: "#111", border: "1px solid #222", borderRadius: "12px", display: "flex", alignItems: "center", padding: "12px", cursor: "pointer" },
  datos: { flex: 1 },
  nombreLista: { margin: 0, fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" },
  dniLista: { margin: 0, fontSize: "11px", color: "#666" },
  badgeVer: { fontSize: "9px", color: "#33b5e5", border: "1px solid #33b5e5", padding: "4px 8px", borderRadius: "5px", fontWeight: "bold" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.95)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 },
  modal: { background: "#0a0a0a", width: "95%", maxWidth: "400px", borderRadius: "20px", padding: "20px", border: "1px solid #333", maxHeight: "85vh", overflowY: "auto" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "#fff", fontSize: "22px" },
  modalHeader: { textAlign: "center", marginBottom: "20px" },
  marcoFoto: { width: "90px", height: "90px", margin: "0 auto 10px auto", borderRadius: "20px", overflow: "hidden", border: "2px solid #33b5e5", background: "#111" },
  foto: { width: "100%", height: "100%", objectFit: "cover" },
  nombreModal: { margin: 0, fontSize: "22px", fontWeight: "900", color: "#fff" }, // NOMBRE EN BLANCO
  catModal: { margin: "2px 0", fontSize: "14px", color: "#33b5e5", fontWeight: "bold" },
  dniModal: { margin: 0, fontSize: "12px", color: "#555" },
  tabla: { display: "flex", flexDirection: "column", gap: "5px" },
  tablaHeader: { display: "flex", padding: "0 10px 5px 10px", color: "#444", fontSize: "10px", fontWeight: "bold" },
  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#111", borderRadius: "10px", border: "1px solid #222" },
  mesName: { fontSize: "11px", fontWeight: "bold", flex: 1 },
  asisResumen: { flex: 2, textAlign: 'center', fontSize: '11px', fontWeight: 'bold' },
  ok: { fontSize: "10px", color: "#16a34a", fontWeight: "bold", flex: 1, textAlign: 'right' },
  deuda: { fontSize: "10px", color: "#ef4444", fontWeight: "bold", flex: 1, textAlign: 'right' },
  vacio: { fontSize: "10px", color: "#333", flex: 1, textAlign: 'right' },
  info: { textAlign: "center", color: "#666", marginTop: "50px" }
};