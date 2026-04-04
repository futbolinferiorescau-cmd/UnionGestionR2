import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase"; 
// Agregamos doc, updateDoc e increment para las fichas
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

const PRIORIDAD_PUESTO = { "ARQUERO": 1, "DEFENSOR": 2, "MEDIOCAMPISTA": 3, "DELANTERO": 4 };
const COLORES = { ARQUERO: "#fbbf24", DEFENSOR: "#3b82f6", MEDIOCAMPISTA: "#10b981", DELANTERO: "#ef4444" };

export default function Tracker() {
  const navigate = useNavigate();
  const [partido, setPartido] = useState(null);
  const [segundos, setSegundos] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const [enCancha, setEnCancha] = useState([]);
  const [banco, setBanco] = useState([]);
  const [yaSalieron, setYaSalieron] = useState([]); 
  const [marcador, setMarcador] = useState({ local: 0, rival: 0 });
  const [eventos, setEventos] = useState([]);
  const [jugadorParaCambio, setJugadorParaCambio] = useState(null);

  useEffect(() => {
    const datos = JSON.parse(localStorage.getItem("partido_activo"));
    if (!datos) { navigate("/gestion/nuevo-partido"); return; }

    const timer = setTimeout(() => {
      setPartido(datos);
      setEnCancha(datos.titulares.map(j => ({ ...j, entroc: 0, minutosTotales: 0 })));
      setBanco(datos.suplentes.map(j => ({ ...j, entroc: null, minutosTotales: 0 })));
    }, 0);

    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    let interval = null;
    if (corriendo) interval = setInterval(() => setSegundos(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [corriendo]);

  const tiempoActualMin = Math.floor(segundos / 60);

  const registrarAccion = (tipo, jugador, eq = "LOCAL") => {
    const min = tiempoActualMin;
    if (tipo === "GOL") {
      setMarcador(prev => ({ ...prev, [eq === "LOCAL" ? "local" : "rival"]: prev[eq === "LOCAL" ? "local" : "rival"] + 1 }));
    }
    setEventos(prev => [{ tipo, jugador, min, eq }, ...prev]);
  };

  const ejecutarCambio = (suplente) => {
    if (!jugadorParaCambio) return;
    const min = tiempoActualMin;
    const minsJugados = min - jugadorParaCambio.entroc;
    const saliendo = { ...jugadorParaCambio, minutosTotales: jugadorParaCambio.minutosTotales + minsJugados, entroc: null };
    const entrando = { ...suplente, entroc: min };

    setEnCancha(prev => prev.filter(x => x.id !== saliendo.id).concat(entrando));
    setBanco(prev => prev.filter(x => x.id !== entrando.id));
    setYaSalieron(prev => [...prev, saliendo]); 
    
    registrarAccion("CAMBIO", `${saliendo.APELLIDO} x ${entrando.APELLIDO}`);
    setJugadorParaCambio(null);
  };

  const handleExpulsion = (j) => {
    if (!window.confirm(`¿EXPULSAR A ${j.APELLIDO}?`)) return;
    const min = tiempoActualMin;
    const minsJugados = min - j.entroc;
    setYaSalieron(prev => [...prev, { ...j, minutosTotales: j.minutosTotales + minsJugados, expulsado: true }]);
    setEnCancha(prev => prev.filter(x => x.id !== j.id));
    registrarAccion("ROJA", j.APELLIDO);
  };

  // --- FINALIZAR Y ACTUALIZAR FICHAS ---
  const finalizarPartido = async () => {
    if (!window.confirm("¿Terminar el partido y guardar estadísticas?")) return;
    
    const minFinal = tiempoActualMin;
    
    // Armamos la lista completa para el informe y para actualizar pibes
    const estadisticasFinales = [
      ...enCancha.map(j => ({
        id: j.id, // DNI
        apellido: j.APELLIDO,
        minutos: j.minutosTotales + (minFinal - j.entroc),
        puesto: j.puesto
      })), 
      ...yaSalieron.map(j => ({
        id: j.id, // DNI
        apellido: j.APELLIDO,
        minutos: j.minutosTotales,
        puesto: j.puesto,
        expulsado: j.expulsado || false
      })), 
      ...banco.map(j => ({
        id: j.id, // DNI
        apellido: j.APELLIDO,
        minutos: 0,
        puesto: j.puesto
      }))
    ];

    try {
      // 1. Guardar informe general
      await addDoc(collection(db, "informes_partidos"), {
        rival: partido.rival,
        categoria: partido.categoria,
        resultado: `${marcador.local} - ${marcador.rival}`,
        eventos: eventos,
        estadisticas: estadisticasFinales,
        fecha: serverTimestamp()
      });

      // 2. Actualizar cada ficha individual usando el DNI (id)
      const actualizaciones = estadisticasFinales.map(async (jugador) => {
        if (jugador.minutos > 0) {
          const jugadorRef = doc(db, "JUGADORES", jugador.id);
          await updateDoc(jugadorRef, {
            minutosJugados: increment(jugador.minutos),
            partidosJugados: increment(1)
          });
        }
      });

      await Promise.all(actualizaciones);

      alert("¡Informe guardado y fichas actualizadas con éxito!");
      navigate("/gestion/historial");
    } catch (e) {
      console.error(e);
      alert("Error al finalizar el partido.");
    }
  };

  const ordenarPorPuesto = (lista) => [...lista].sort((a,b) => PRIORIDAD_PUESTO[a.puesto] - PRIORIDAD_PUESTO[b.puesto]);

  if (!partido) return null;

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "150px" }}>
      <Navbar />

      <div style={headerStyle}>
        <div style={marcadorRow}>
          <div style={equipoBox}>
            <img src="/images/unionas_escudo.png" style={escudo} alt="U" />
            <span style={labelEq}>UNIÓN</span>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={scoreNums}>{marcador.local} - {marcador.rival}</div>
            <div style={timer}>{Math.floor(segundos/60)}:{String(segundos%60).padStart(2,'0')}</div>
          </div>
          <div style={equipoBox}>
            {partido.escudo && <img src={partido.escudo} style={escudo} alt="R" />}
            <span style={labelEq}>{partido.rival.toUpperCase()}</span>
          </div>
        </div>
        <div style={controlRow}>
          <button onClick={() => setCorriendo(!corriendo)} style={corriendo ? btnPausa : btnPlay}>
            {corriendo ? "PAUSAR" : "INICIAR"}
          </button>
          <button onClick={() => registrarAccion("GOL", "Rival", "RIVAL")} style={btnRival}>GOL RIVAL</button>
          <button onClick={finalizarPartido} style={btnFinish}>FINALIZAR</button>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        <h3 style={sectionTitle}>EN CANCHA ({enCancha.length})</h3>
        
        <div style={gridJugadores}>
          {ordenarPorPuesto(enCancha).map(j => (
            <div key={j.id} style={{ ...card, borderLeft: `6px solid ${COLORES[j.puesto]}` }}>
              <div style={{ flex: 1 }}>
                <div style={nameTxt}>{j.APELLIDO}</div>
                <div style={roleTxt}>{j.puesto}</div>
              </div>
              <div style={actions}>
                <button onClick={() => registrarAccion("GOL", j.APELLIDO)} style={btnBig}>⚽</button>
                <button onClick={() => registrarAccion("AMARILLA", j.APELLIDO)} style={btnBig}>🟨</button>
                <button onClick={() => handleExpulsion(j)} style={btnBig}>🟥</button>
                <button onClick={() => setJugadorParaCambio(j)} style={btnBigChange}>🔄</button>
              </div>
            </div>
          ))}
        </div>

        {jugadorParaCambio && (
          <div style={subPanel}>
            <p style={subTitle}>ENTRA POR {jugadorParaCambio.APELLIDO}:</p>
            <div style={scrollSuplentes}>
              {banco.map(s => (
                <button key={s.id} onClick={() => ejecutarCambio(s)} style={btnSuplente}>{s.APELLIDO}</button>
              ))}
              <button onClick={() => setJugadorParaCambio(null)} style={btnX}>X</button>
            </div>
          </div>
        )}

        <h3 style={sectionTitle}>HISTORIAL</h3>
        <div style={historial}>
          {eventos.map((e, i) => (
            <div key={i} style={histItem}>
              <span style={{color: '#16a34a'}}>{e.min}'</span> {e.tipo}: {e.jugador}
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

// ESTILOS (Se mantienen los mismos que tenías)
const headerStyle = { background: "#111", padding: "15px", position: "sticky", top: 0, zIndex: 100, borderBottom: "1px solid #333" };
const marcadorRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" };
const equipoBox = { display: "flex", flexDirection: "column", alignItems: "center", width: "30%" };
const escudo = { width: "55px", height: "55px", objectFit: "contain" };
const labelEq = { fontSize: "10px", marginTop: "5px", color: "#aaa", fontWeight: "bold" };
const scoreNums = { fontSize: "38px", fontWeight: "900" };
const timer = { fontSize: "20px", fontWeight: "bold", color: "#16a34a" };
const controlRow = { display: "flex", gap: "8px" };
const btnPlay = { flex: 1.5, background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "bold" };
const btnPausa = { flex: 1.5, background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "bold" };
const btnRival = { flex: 1, background: "#222", color: "#fff", border: "1px solid #444", borderRadius: "10px", fontSize: "10px" };
const btnFinish = { flex: 1, background: "#fff", color: "#000", border: "none", borderRadius: "10px", fontSize: "10px", fontWeight: "bold" };

const sectionTitle = { fontSize: "12px", color: "#fff", textAlign: "center", margin: "20px 0 10px", textTransform: "uppercase", letterSpacing: "1px" };
const subTitle = { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#fff" };
const gridJugadores = { display: "flex", flexDirection: "column", gap: "8px" };
const card = { background: "#111", padding: "12px 15px", borderRadius: "10px", display: "flex", alignItems: "center", border: "1px solid #222" };
const nameTxt = { fontSize: "16px", fontWeight: "bold" };
const roleTxt = { fontSize: "9px", color: "#666", fontWeight: "bold" };
const actions = { display: "flex", gap: "6px" };

const btnBig = { background: "#222", border: "none", padding: "10px", borderRadius: "8px", fontSize: "22px", transition: "transform 0.1s", cursor: "pointer", display: "flex", alignItems: "center" };
const btnBigChange = { ...btnBig, background: "#16a34a" };
const btnSuplente = { background: "#16a34a", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "bold", whiteSpace: "nowrap" };
const subPanel = { position: "fixed", bottom: "85px", left: 0, width: "100%", background: "#1a1a1a", padding: "15px", borderTop: "3px solid #16a34a", zIndex: 200 };
const scrollSuplentes = { display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "5px" };
const historial = { background: "#111", borderRadius: "10px", padding: "15px", border: "1px solid #222" };
const histItem = { padding: "6px 0", borderBottom: "1px solid #222", fontSize: "13px" };
const btnX = { background: "#ef4444", color: "#fff", border: "none", padding: "10px 15px", borderRadius: "10px" };