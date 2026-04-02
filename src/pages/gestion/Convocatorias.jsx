import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Picker from "react-mobile-picker";
import PlacaConvocatoria from "../../components/PlacaConvocatoria";

const CATEGORIAS = [
  { label: "Escuelita (2020/2021)", años: [2020, 2021] },
  { label: "Categoría 2019", años: [2019] },
  { label: "Categoría 2018", años: [2018] },
  { label: "Categoría 2017", años: [2017] },
  { label: "Categoría 2016", años: [2016] },
  { label: "Categoría 2015", años: [2015] },
  { label: "Categoría 2014", años: [2014] },
  { label: "2013 - Séptima", años: [2013] },
  { label: "2012 - Sexta", años: [2012] },
  { label: "2011/2010 - Quinta", años: [2011, 2010] },
  { label: "2009/2008 - Cuarta", años: [2009, 2008] },
];

const HORAS = Array.from({ length: 17 }, (_, i) => (i + 7).toString().padStart(2, "0"));
const MINUTOS = ["00", "15", "30", "45"];

export default function Convocatorias() {
  const [pantalla, setPantalla] = useState("categorias");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [rivales, setRivales] = useState([]);
  const [rivalId, setRivalId] = useState("");
  const [rivalNombre, setRivalNombre] = useState("");
  const [rivalEscudo, setRivalEscudo] = useState("");
  const [cancha, setCancha] = useState("");
  const [canchaPersonalizada, setCanchaPersonalizada] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState({ hora: "08", minutos: "00" });
  const [mostrarHora, setMostrarHora] = useState(false);
  const [mostrarRivales, setMostrarRivales] = useState(false);
  const [mostrarCanchas, setMostrarCanchas] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [jugadores, setJugadores] = useState([]);
  const [citados, setCitados] = useState({});
  const [fotos, setFotos] = useState({});
  const storage = getStorage();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRivales = async () => {
      try {
        const snap = await getDocs(collection(db, "rivales"));
        const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        setRivales(lista);
      } catch { /* Error silencioso */ }
    };
    fetchRivales();
  }, []);

  useEffect(() => {
    if (!categoriaSeleccionada) return;
    const fetchJugadores = async () => {
      try {
        const snap = await getDocs(collection(db, "JUGADORES"));
        const lista = snap.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((j) => {
            // Filtro híbrido: Primero buscamos por campo CATEGORIA, sino por AÑO
            if (j.CATEGORIA && j.CATEGORIA === categoriaSeleccionada.label) return true;
            if (j["FECHA NACIMIENTO"]) {
               const año = parseInt(j["FECHA NACIMIENTO"].split("/")[2]);
               return categoriaSeleccionada.años.includes(año);
            }
            return false;
          })
          .sort((a, b) => a.APELLIDO.localeCompare(b.APELLIDO));
        
        setJugadores(lista);
        const inicial = {};
        lista.forEach((j) => { inicial[j.id] = false; });
        setCitados(inicial);
      } catch { /* Error silencioso */ }
    };
    fetchJugadores();
  }, [categoriaSeleccionada]);

  useEffect(() => {
    if (jugadores.length === 0) return;
    const cargarFotos = async () => {
      const nuevasFotos = {};
      for (const j of jugadores) {
        const extensiones = [".jpg", ".jpeg", ".png"];
        for (const ext of extensiones) {
          try {
            const url = await getDownloadURL(ref(storage, `fotos_jugadores/${j.id}${ext}`));
            nuevasFotos[j.id] = url;
            break;
          } catch { continue; }
        }
      }
      setFotos(nuevasFotos);
    };
    cargarFotos();
  }, [jugadores, storage]); // Agregamos storage a las dependencias

  const totalCitados = Object.values(citados).filter(Boolean).length;

  const inputStyle = {
    width: "100%", padding: "14px", background: "#1e1e1e", border: "1px solid #2e2e2e",
    borderRadius: "12px", color: "#fff", fontSize: "15px", colorScheme: "dark", boxSizing: "border-box",
  };

  const pageStyle = { background: "#111", minHeight: "100vh", paddingBottom: "100px" };

  const botonVolver = (accion) => (
    <button onClick={accion} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}>
      ← Volver
    </button>
  );

  // --- PANTALLA CATEGORIAS ---
  if (pantalla === "categorias") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          <button onClick={() => window.history.back()} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}>
            ← Atrás
          </button>
          <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "24px", color: "#fff", textTransform: "uppercase" }}>Seleccioná Categoría</h1>
          <div>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Infantiles</p>
            {CATEGORIAS.slice(0, 7).map((cat) => (
              <button key={cat.label} onClick={() => { setCategoriaSeleccionada(cat); setPantalla("configurar"); }} style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                {cat.label} <span style={{ color: "#555" }}>›</span>
              </button>
            ))}
          </div>
          <div style={{ marginTop: "16px" }}>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Juveniles</p>
            {CATEGORIAS.slice(7).map((cat) => (
              <button key={cat.label} onClick={() => { setCategoriaSeleccionada(cat); setPantalla("configurar"); }} style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                {cat.label} <span style={{ color: "#555" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- PANTALLA CONFIGURAR ---
  if (pantalla === "configurar") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          {botonVolver(() => setPantalla("categorias"))}
          <h1 style={{ fontSize: "20px", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: "24px" }}>Configurar Partido</h1>
          
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Rival del partido</p>
          <button onClick={() => setMostrarRivales(!mostrarRivales)} style={{ ...inputStyle, textAlign: "left", cursor: "pointer", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
            {rivalEscudo ? <img src={rivalEscudo} alt="e" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "50%" }} /> : <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#333" }} />}
            <span style={{ color: rivalNombre ? "#fff" : "#666" }}>{rivalNombre || "Seleccionar Rival..."}</span>
          </button>

          {mostrarRivales && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px", overflowY: "auto", maxHeight: "200px" }}>
              {rivales.map((r) => (
                <button key={r.id} onClick={() => { setRivalId(r.id); setRivalNombre(r.nombre); setRivalEscudo(r.escudoUrl || ""); setMostrarRivales(false); }} style={{ width: "100%", padding: "12px 16px", background: rivalId === r.id ? "#2e2e2e" : "transparent", border: "none", borderBottom: "1px solid #2e2e2e", color: "#fff", fontSize: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "10px" }}>
                  {r.escudoUrl && <img src={r.escudoUrl} alt="e" style={{ width: "28px", height: "28px", objectFit: "contain" }} />} {r.nombre}
                </button>
              ))}
            </div>
          )}

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>¿En qué cancha?</p>
          <button onClick={() => setMostrarCanchas(!mostrarCanchas)} style={{ ...inputStyle, textAlign: "left", marginBottom: "8px", color: cancha ? "#fff" : "#666" }}>
            {cancha === "otro" ? (canchaPersonalizada || "Escribí la cancha...") : cancha || "Seleccionar Cancha..."}
          </button>

          {mostrarCanchas && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px", maxHeight: "200px", overflowY: "auto" }}>
              {rivales.map((r) => (
                <button key={r.id} onClick={() => { setCancha(r.nombre); setMostrarCanchas(false); }} style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", borderBottom: "1px solid #2e2e2e", color: "#fff", fontSize: "14px", textAlign: "left" }}>{r.nombre}</button>
              ))}
              <button onClick={() => { setCancha("otro"); setMostrarCanchas(false); }} style={{ width: "100%", padding: "12px 16px", color: "#aaa", border: "none", textAlign: "left" }}>Otro...</button>
            </div>
          )}

          {cancha === "otro" && <input value={canchaPersonalizada} onChange={(e) => setCanchaPersonalizada(e.target.value)} placeholder="Nombre de la cancha..." style={{ ...inputStyle, marginBottom: "16px" }} />}

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Fecha</p>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} style={{ ...inputStyle, marginBottom: "16px" }} />

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Hora</p>
          <button onClick={() => setMostrarHora(!mostrarHora)} style={{ ...inputStyle, textAlign: "left", marginBottom: "8px" }}>{hora.hora}:{hora.minutos} HS</button>

          {mostrarHora && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px" }}>
              <Picker value={hora} onChange={setHora} height={150}>
                <Picker.Column name="hora">{HORAS.map(h => <Picker.Item key={h} value={h}>{({selected}) => <div style={{color: selected ? "#fff" : "#555", fontWeight: selected?700:400}}>{h}</div>}</Picker.Item>)}</Picker.Column>
                <Picker.Column name="minutos">{MINUTOS.map(m => <Picker.Item key={m} value={m}>{({selected}) => <div style={{color: selected ? "#fff" : "#555", fontWeight: selected?700:400}}>{m}</div>}</Picker.Item>)}</Picker.Column>
              </Picker>
              <button onClick={() => setMostrarHora(false)} style={{ width: "100%", padding: "12px", background: "#2e2e2e", color: "#fff", border: "none" }}>Confirmar</button>
            </div>
          )}

          <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Observaciones..." rows={3} style={{ ...inputStyle, resize: "none" }} />
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
          <button onClick={() => { if (rivalId && fecha) setPantalla("citados"); }} style={{ width: "100%", padding: "16px", background: rivalId && fecha ? "#16a34a" : "#2e2e2e", borderRadius: "12px", color: "#fff", border: "none", fontWeight: 700 }}>CONTINUAR A CITADOS</button>
        </div>
      </div>
    );
  }

  // --- PANTALLA CITADOS (CON EL CAMBIO DE DISEÑO EN NOMBRES) ---
  if (pantalla === "citados") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          {botonVolver(() => setPantalla("configurar"))}
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px", color: "#fff" }}>CITACIÓN: {categoriaSeleccionada.label.toUpperCase()}</h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {jugadores.map((jugador) => {
              const citado = citados[jugador.id];
              return (
                <div key={jugador.id} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                  <button onClick={() => navigate(`/gestion/ficha/${jugador.id}`)} style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#2e2e2e", overflow: "hidden", border: "none", flexShrink: 0 }}>
                    {fotos[jugador.id] ? <img src={fotos[jugador.id]} alt="f" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{fontSize:"20px", opacity:0.3}}>👤</div>}
                  </button>
                  
                  {/* AQUÍ EL CAMBIO: Apellido arriba Negrita, Nombre abajo Chico */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "#fff", fontSize: "16px", fontWeight: "900", textTransform: "uppercase", lineHeight: "1.2" }}>
                      {jugador.APELLIDO}
                    </span>
                    <span style={{ color: "#888", fontSize: "13px", fontWeight: "400", textTransform: "capitalize" }}>
                      {jugador.NOMBRE.toLowerCase()}
                    </span>
                  </div>

                  <div onClick={() => setCitados((prev) => ({ ...prev, [jugador.id]: !prev[jugador.id] }))} style={{ width: "48px", height: "26px", borderRadius: "13px", background: citado ? "#16a34a" : "#333", display: "flex", alignItems: "center", padding: "3px", cursor: "pointer", transition: "0.2s" }}>
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transform: citado ? "translateX(22px)" : "translateX(0)", transition: "0.2s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px 16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
          <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "15px", marginBottom: "10px", textAlign: "center" }}>ELEGIDOS: {totalCitados}</p>
          <button onClick={() => setPantalla("pdf")} disabled={totalCitados === 0} style={{ width: "100%", padding: "16px", background: totalCitados > 0 ? "#fff" : "#2e2e2e", borderRadius: "12px", color: totalCitados > 0 ? "#111" : "#666", fontWeight: 700, border: "none" }}>GENERAR Y COMPARTIR PDF</button>
        </div>
      </div>
    );
  }

  if (pantalla === "pdf") {
    const jugadoresCitados = jugadores.filter((j) => citados[j.id]);
    return <PlacaConvocatoria categoria={categoriaSeleccionada.label} rival={rivalNombre} escudoRival={rivalEscudo} cancha={cancha === "otro" ? canchaPersonalizada : cancha} fecha={fecha} hora={`${hora.hora}:${hora.minutos}`} observaciones={observaciones} jugadoresCitados={jugadoresCitados} fotos={fotos} onVolver={() => setPantalla("citados")} />;
  }

  return null;
}