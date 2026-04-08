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

  // 1. Carga inicial de datos (Texto y Asistencias)
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const jugSnap = await getDocs(collection(db, "JUGADORES"));
      const asisSnap = await getDocs(collection(db, "ASISTENCIAS"));
      const pagosSnap = await getDocs(collection(db, "pagos_plus"));

      setListaJugadores(jugSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setAsistenciasAnuales(asisSnap.docs.map(doc => doc.data()));
      setPagosAnuales(pagosSnap.docs.map(doc => doc.data()));
    } catch (err) {
      console.error("Error al conectar con Firebase:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // 2. Función para abrir la ficha y buscar la foto por DNI en el momento
  const abrirFicha = async (jugador) => {
    setJugadorSeleccionado(jugador);
    setFotoUrlSeleccionada(""); // Limpia la foto anterior
    
    const dni = String(jugador.DNI || "").trim();
    let urlEncontrada = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Default

    if (dni) {
      const extensiones = [".jpg", ".JPG", ".png", ".jpeg"];
      for (const ext of extensiones) {
        try {
          const fotoRef = ref(storage, `fotos_jugadores/${dni}${ext}`);
          urlEncontrada = await getDownloadURL(fotoRef);
          break; // Si la encuentra, sale del bucle
        } catch { /* Sigue probando */ }
      }
    }
    setFotoUrlSeleccionada(urlEncontrada);
  };

  // 3. Lógica del buscador (Apellido o DNI)
  const jugadoresFiltrados = listaJugadores.filter(j => 
    `${j.NOMBRE} ${j.APELLIDO}`.toLowerCase().includes(busqueda.toLowerCase()) || 
    String(j.DNI).includes(busqueda)
  );

  // 4. Cálculo del cuadro anual (Feb a Dic)
  const calcularResumenAnual = (jugador) => {
    const nombreCompleto = `${jugador.NOMBRE} ${jugador.APELLIDO}`.toUpperCase().trim();
    const dniJug = String(jugador.DNI || "");

    return mesesCiclo.map(m => {
      // Filtramos asistencias de este mes específico
      const countAsis = asistenciasAnuales.filter(asis => {
        const f = asis.fecha || "";
        if (!f.includes(`-${m.id}-2026`)) return false;

        // Buscamos el nombre en el array 'presentes' y en los campos sueltos (5, 6, 7...)
        const presentesEnDoc = [
          ...(asis.presentes || []),
          ...Object.values(asis).filter(v => typeof v === 'string' && v.length > 5 && v !== asis.fecha)
        ].map(n => n.toUpperCase().trim());

        return presentesEnDoc.includes(nombreCompleto);
      }).length;

      // Verificamos si existe un pago registrado para ese mes
      const pagado = pagosAnuales.some(p => String(p.dni) === dniJug && p.mesAnio === `2026-${m.id}`);

      return { ...m, countAsis, pagado };
    });
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.titulo}>GESTIÓN DE PLUS</h1>
        
        <div style={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Buscar por Apellido o DNI..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {loading ? <p style={styles.info}>Cargando lista de jugadores...</p> : (
          <div style={styles.grid}>
            {jugadoresFiltrados.map(jug => (
              <div key={jug.id} style={styles.fichaSimple} onClick={() => abrirFicha(jug)}>
                <div style={styles.datos}>
                    <p style={styles.nombre}>{jug.APELLIDO}, {jug.NOMBRE}</p>
                    <p style={styles.dni}>DNI: {jug.DNI} • {jug.CATEGORIA || 'S/C'}</p>
                </div>
                <div style={styles.badgeVer}>VER HISTORIAL</div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODAL: DETALLE ANUAL --- */}
        {jugadorSeleccionado && (
          <div style={styles.overlay} onClick={() => setJugadorSeleccionado(null)}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setJugadorSeleccionado(null)}>✕</button>
              
              <div style={styles.modalHeader}>
                <div style={styles.marcoFoto}>
                  <img src={fotoUrlSeleccionada} style={styles.foto} alt="pibe" />
                </div>
                <h2 style={styles.nombreModal}>{jugadorSeleccionado.NOMBRE} {jugadorSeleccionado.APELLIDO}</h2>
                <p style={styles.dniModal}>DNI: {jugadorSeleccionado.DNI}</p>
              </div>

              <div style={styles.tabla}>
                <div style={styles.tablaHeader}>
                  <span>MES</span>
                  <span>ASISTENCIAS</span>
                  <span>ESTADO</span>
                </div>
                {calcularResumenAnual(jugadorSeleccionado).map(res => (
                  <div key={res.id} style={styles.fila}>
                    <span style={styles.mesName}>{res.nombre}</span>
                    <span style={styles.asisCount}>{res.countAsis} ⚽</span>
                    <span style={res.pagado ? styles.ok : (res.countAsis > 0 ? styles.deuda : styles.vacio)}>
                      {res.pagado ? "PAGADO" : (res.countAsis > 0 ? "DEUDA" : "---")}
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
  titulo: { fontSize: "20px", fontWeight: "900", textAlign: "center", marginBottom: "20px", color: "#fff" },
  searchWrapper: { marginBottom: "20px" },
  searchInput: { width: "100%", background: "#111", border: "1px solid #333", color: "#fff", padding: "16px", borderRadius: "15px", fontSize: "16px", outline: "none", boxSizing: "border-box" },
  grid: { display: "flex", flexDirection: "column", gap: "10px" },
  fichaSimple: { background: "#111", border: "1px solid #222", borderRadius: "12px", display: "flex", alignItems: "center", padding: "15px", cursor: "pointer" },
  datos: { flex: 1 },
  nombre: { margin: 0, fontWeight: "900", fontSize: "15px" },
  dni: { margin: 0, fontSize: "11px", color: "#666" },
  badgeVer: { fontSize: "9px", fontWeight: "900", color: "#33b5e5", border: "1px solid #33b5e5", padding: "5px 10px", borderRadius: "6px" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.9)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "15px" },
  modal: { background: "#0a0a0a", width: "100%", maxWidth: "400px", borderRadius: "24px", padding: "20px", position: "relative", border: "1px solid #333", maxHeight: "85vh", overflowY: "auto" },
  closeBtn: { position: "absolute", top: "15px", right: "15px", background: "none", border: "none", color: "#fff", fontSize: "24px" },
  modalHeader: { textAlign: "center", marginBottom: "20px" },
  marcoFoto: { width: "100px", height: "100px", margin: "0 auto 10px auto", borderRadius: "20px", overflow: "hidden", border: "2px solid #33b5e5", background: "#111" },
  foto: { width: "100%", height: "100%", objectFit: "cover" },
  nombreModal: { margin: 0, fontSize: "20px", fontWeight: "900" },
  dniModal: { margin: 0, fontSize: "12px", color: "#666" },
  tabla: { display: "flex", flexDirection: "column", gap: "5px" },
  tablaHeader: { display: "flex", justifyContent: "space-between", padding: "0 10px 5px 10px", color: "#444", fontSize: "10px", fontWeight: "bold" },
  fila: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "#111", borderRadius: "10px", border: "1px solid #222" },
  mesName: { fontSize: "11px", fontWeight: "bold", width: "80px" },
  asisCount: { fontSize: "11px", color: "#33b5e5", fontWeight: "bold" },
  ok: { fontSize: "10px", color: "#16a34a", fontWeight: "bold" },
  deuda: { fontSize: "10px", color: "#ef4444", fontWeight: "bold" },
  vacio: { fontSize: "10px", color: "#333" },
  info: { textAlign: "center", marginTop: "50px", color: "#666" }
};