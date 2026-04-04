import { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

// --- TU FUNCIÓN DE CATEGORÍAS ---
function obtenerNombreCategoria(fechaNacimiento) {
  if (!fechaNacimiento) return "Sin datos";
  try {
    const partes = fechaNacimiento.split("/");
    const año = parseInt(partes[2]);
    if (año === 2013) return "Séptima";
    if (año === 2012) return "Sexta";
    if (año === 2011 || año === 2010) return "Quinta";
    if (año === 2009 || año === 2008) return "Cuarta";
    return "Otras";
  } catch { return "Error"; }
}

const COLORES = {
  ARQUERO: "#fbbf24", 
  DEFENSOR: "#3b82f6", 
  MEDIOCAMPISTA: "#10b981", 
  DELANTERO: "#ef4444", 
  SUPLENTE: "#444"     
};

export default function NuevoPartido() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1); 
  const [listaRivales, setListaRivales] = useState([]);
  const [rivalSel, setRivalSel] = useState(null);
  const [categoriaSel, setCategoriaSel] = useState("Quinta");
  const [minutosPorTiempo, setMinutosPorTiempo] = useState(40); // Nuevo: Duración
  const [jugadoresDB, setJugadoresDB] = useState([]);
  const [convocados, setConvocados] = useState([]); 
  const [puestoActivo, setPuestoActivo] = useState("DEFENSOR");

  // 1. CARGAR RIVALES (Usando escudoUrl)
  useEffect(() => {
    const cargarTodo = async () => {
      const snapR = await getDocs(collection(db, "rivales"));
      setListaRivales(snapR.docs.map(doc => ({ 
        id: doc.id, 
        nombre: doc.data().nombre, 
        escudo: doc.data().escudoUrl // CORREGIDO: Usamos escudoUrl
      })));
      
      const snapJ = await getDocs(collection(db, "JUGADORES"));
      setJugadoresDB(snapJ.docs.map(doc => ({ id: doc.id, ...doc.data(), puesto: "SUPLENTE" })));
    };
    cargarTodo();
  }, []);

  const jugadoresFiltrados = jugadoresDB.filter(j => 
    obtenerNombreCategoria(j["FECHA NACIMIENTO"]).includes(categoriaSel)
  ).sort((a, b) => (a.APELLIDO || "").localeCompare(b.APELLIDO || ""));

  const toggleConvocado = (j) => {
    if (convocados.find(x => x.id === j.id)) {
      setConvocados(convocados.filter(x => x.id !== j.id));
    } else {
      setConvocados([...convocados, j]);
    }
  };

  const pintarJugador = (id) => {
    setConvocados(convocados.map(j => {
      if (j.id === id) {
        return { ...j, puesto: j.puesto === puestoActivo ? "SUPLENTE" : puestoActivo };
      }
      return j;
    }));
  };

  const contar = (p) => convocados.filter(j => j.puesto === p).length;

  return (
    <div style={{ background: "#000", minHeight: "100vh", paddingBottom: "150px", color: "#fff" }}>
      <Navbar />
      <div style={{ padding: "16px" }}>
        
        {etapa === 1 ? (
          /* --- ETAPA 1: CONVOCATORIA Y TIEMPO --- */
          <>
            <h2 style={tituloBlancoCentrado}>1. PREPARACIÓN</h2>
            
            <div style={cardGris}>
              <label style={labelMini}>RIVAL</label>
              <select style={selectStyle} onChange={(e) => setRivalSel(listaRivales.find(r => r.nombre === e.target.value))}>
                <option value="">Elegir Rival...</option>
                {listaRivales.map(r => <option key={r.id} value={r.nombre}>{r.nombre}</option>)}
              </select>

              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <div style={{flex: 1}}>
                  <label style={labelMini}>CATEGORÍA</label>
                  <select style={selectStyle} value={categoriaSel} onChange={(e) => setCategoriaSel(e.target.value)}>
                    {["Cuarta", "Quinta", "Sexta", "Séptima"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={labelMini}>MINUTOS POR TIEMPO</label>
                  <select style={selectStyle} value={minutosPorTiempo} onChange={(e) => setMinutosPorTiempo(Number(e.target.value))}>
                    {[20, 25, 30, 35, 40, 45].map(m => <option key={m} value={m}>{m} min</option>)}
                  </select>
                </div>
              </div>
            </div>

            <h3 style={subHeaderBlancoCentrado}>LISTADO DE CONVOCADOS ({convocados.length})</h3>
            <div style={gridJugadores}>
              {jugadoresFiltrados.map(j => (
                <button key={j.id} onClick={() => toggleConvocado(j)} style={{
                  ...btnJugador,
                  background: convocados.find(x => x.id === j.id) ? "#16a34a" : "#1a1a1a",
                  border: convocados.find(x => x.id === j.id) ? "1px solid #fff" : "1px solid #333"
                }}>
                  {j.APELLIDO}
                </button>
              ))}
            </div>

            {convocados.length >= 11 && rivalSel && (
              <div style={footer}>
                <button onClick={() => setEtapa(2)} style={btnOk}>OK, ARMAR TÁCTICA ›</button>
              </div>
            )}
          </>
        ) : (
          /* --- ETAPA 2: ALINEACIÓN (PINCEL) --- */
          <>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '15px'}}>
              {rivalSel.escudo && (
                <div style={escudoCirculo}>
                   <img src={rivalSel.escudo} style={{width: '50px', height: '50px', objectFit: 'contain'}} />
                </div>
              )}
              <h2 style={tituloBlancoCentrado}>{categoriaSel} vs {rivalSel.nombre}</h2>
              <p style={{color: '#aaa', fontSize: '12px'}}>Partido de 2 tiempos de {minutosPorTiempo}'</p>
            </div>

            <div style={contenedorPinceles}>
              {["ARQUERO", "DEFENSOR", "MEDIOCAMPISTA", "DELANTERO"].map(p => (
                <button key={p} onClick={() => setPuestoActivo(p)} style={{
                  ...btnPincel,
                  background: COLORES[p],
                  outline: puestoActivo === p ? "3px solid #fff" : "none",
                  opacity: puestoActivo === p ? 1 : 0.6
                }}>
                  {p.substring(0,3)} ({contar(p)})
                </button>
              ))}
            </div>

            <h3 style={subHeaderBlancoCentrado}>PINTAR TITULARES</h3>

            <div style={gridJugadores}>
              {convocados.map(j => (
                <button key={j.id} onClick={() => pintarJugador(j.id)} style={{
                  ...btnJugador,
                  background: COLORES[j.puesto],
                  height: '70px',
                  border: j.puesto !== "SUPLENTE" ? "2px solid #fff" : "1px solid #333"
                }}>
                  {j.APELLIDO}
                  <span style={{display: 'block', fontSize: '9px', marginTop: '5px', opacity: 0.7}}>
                    {j.puesto === "SUPLENTE" ? "SUP" : j.puesto}
                  </span>
                </button>
              ))}
            </div>

            <div style={footer}>
              <button onClick={() => setEtapa(1)} style={btnVolver}>ATRÁS</button>
              {contar("ARQUERO") + contar("DEFENSOR") + contar("MEDIOCAMPISTA") + contar("DELANTERO") === 11 && (
                <button onClick={() => {
                  const final = { 
                    rival: rivalSel.nombre, 
                    escudo: rivalSel.escudo,
                    categoria: categoriaSel, 
                    tiempoPorPeriodo: minutosPorTiempo,
                    titulares: convocados.filter(x => x.puesto !== "SUPLENTE"),
                    suplentes: convocados.filter(x => x.puesto === "SUPLENTE")
                  };
                  localStorage.setItem("partido_activo", JSON.stringify(final));
                  navigate("/gestion/tracker");
                }} style={btnFinal}>¡A LA CANCHA! ⚽</button>
              )}
            </div>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

// ESTILOS
const tituloBlancoCentrado = { fontSize: "22px", fontWeight: "900", marginBottom: "5px", color: "#fff", textAlign: "center", textTransform: "uppercase" };
const subHeaderBlancoCentrado = { fontSize: "14px", color: "#fff", marginBottom: "15px", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px" };
const labelMini = { fontSize: '10px', color: '#16a34a', fontWeight: 'bold', marginBottom: '5px', display: 'block' };
const cardGris = { background: "#111", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #222" };
const selectStyle = { width: "100%", background: "#222", color: "#fff", border: "1px solid #333", padding: "12px", borderRadius: "8px" };
const gridJugadores = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" };
const btnJugador = { padding: "15px 5px", borderRadius: "10px", color: "#fff", fontWeight: "bold", fontSize: "11px" };
const contenedorPinceles = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "5px", marginBottom: "20px", position: 'sticky', top: '10px', zIndex: 10 };
const btnPincel = { padding: "12px 2px", borderRadius: "8px", border: "none", color: "#fff", fontWeight: "900", fontSize: "10px" };
const footer = { position: "fixed", bottom: "85px", left: 0, width: "100%", padding: "15px", background: "#000", display: "flex", gap: "10px", borderTop: '1px solid #222' };
const btnOk = { width: "100%", padding: "18px", background: "#fff", color: "#000", borderRadius: "12px", fontWeight: "900" };
const btnVolver = { flex: 1, padding: "15px", background: "#222", color: "#fff", borderRadius: "12px", border: "none" };
const btnFinal = { flex: 2, padding: "15px", background: "#16a34a", color: "#fff", borderRadius: "12px", border: "none", fontWeight: "900" };
const escudoCirculo = { background: '#fff', padding: '5px', borderRadius: '50%', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '65px', height: '65px' };