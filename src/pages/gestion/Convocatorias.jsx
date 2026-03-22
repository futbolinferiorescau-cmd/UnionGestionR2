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

const HORAS = Array.from({ length: 17 }, (_, i) =>
  (i + 7).toString().padStart(2, "0")
);
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
      const snap = await getDocs(collection(db, "rivales"));
      const lista = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setRivales(lista);
    };
    fetchRivales();
  }, []);

  useEffect(() => {
    if (!categoriaSeleccionada) return;
    const fetchJugadores = async () => {
      const snap = await getDocs(collection(db, "JUGADORES"));
      const lista = snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((j) => {
          const año = parseInt(j["FECHA NACIMIENTO"].split("/")[2]);
          return categoriaSeleccionada.años.includes(año);
        })
        .sort((a, b) => a.APELLIDO.localeCompare(b.APELLIDO));
      setJugadores(lista);
      const inicial = {};
      lista.forEach((j) => { inicial[j.id] = false; });
      setCitados(inicial);
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
          } catch {
            continue;
          }
        }
      }
      setFotos(nuevasFotos);
    };
    cargarFotos();
  }, [jugadores]);

  const totalCitados = Object.values(citados).filter(Boolean).length;

  const inputStyle = {
    width: "100%",
    padding: "14px",
    background: "#1e1e1e",
    border: "1px solid #2e2e2e",
    borderRadius: "12px",
    color: "#fff",
    fontSize: "15px",
    colorScheme: "dark",
    boxSizing: "border-box",
  };

  const pageStyle = {
    background: "#111",
    minHeight: "100vh",
    paddingBottom: "100px",
  };

  const botonVolver = (accion) => (
    <button
      onClick={accion}
      style={{
        background: "#1e1e1e",
        border: "1px solid #2e2e2e",
        borderRadius: "10px",
        color: "#fff",
        fontSize: "14px",
        padding: "8px 16px",
        marginBottom: "20px",
        cursor: "pointer",
      }}
    >
      ← Volver
    </button>
  );

  if (pantalla === "categorias") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          <button
            onClick={() => window.history.back()}
            style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}
          >
            ← Atrás
          </button>
          <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "24px", color: "#fff", textTransform: "uppercase" }}>
            Seleccioná Categoría
          </h1>
          <div style={{ marginBottom: "16px" }}>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Infantiles
            </p>
            {CATEGORIAS.slice(0, 7).map((cat) => (
              <button
                key={cat.label}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("configurar"); }}
                style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                {cat.label}
                <span style={{ color: "#555" }}>›</span>
              </button>
            ))}
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
              Juveniles
            </p>
            {CATEGORIAS.slice(7).map((cat) => (
              <button
                key={cat.label}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("configurar"); }}
                style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                {cat.label}
                <span style={{ color: "#555" }}>›</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (pantalla === "configurar") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          {botonVolver(() => setPantalla("categorias"))}

          <h1 style={{ fontSize: "20px", fontWeight: 700, textTransform: "uppercase", color: "#fff", marginBottom: "24px" }}>
            Configurar Partido
          </h1>

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Rival del partido</p>
          <button
            onClick={() => setMostrarRivales(!mostrarRivales)}
            style={{ ...inputStyle, textAlign: "left", cursor: "pointer", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}
          >
            {rivalEscudo ? (
              <img src={rivalEscudo} alt="escudo" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "50%" }} />
            ) : (
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#333" }} />
            )}
            <span style={{ color: rivalNombre ? "#fff" : "#666" }}>
              {rivalNombre || "Seleccionar Rival..."}
            </span>
          </button>

          {mostrarRivales && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px", overflow: "hidden", maxHeight: "200px", overflowY: "auto" }}>
              {rivales.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setRivalId(r.id);
                    setRivalNombre(r.nombre);
                    setRivalEscudo(r.escudoUrl || "");
                    setMostrarRivales(false);
                  }}
                  style={{ width: "100%", padding: "12px 16px", background: rivalId === r.id ? "#2e2e2e" : "transparent", border: "none", borderBottom: "1px solid #2e2e2e", color: "#fff", fontSize: "14px", textAlign: "left", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                >
                  {r.escudoUrl && (
                    <img src={r.escudoUrl} alt="escudo" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "50%" }} />
                  )}
                  {r.nombre}
                </button>
              ))}
            </div>
          )}

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>¿En qué cancha jugamos?</p>
          <button
            onClick={() => setMostrarCanchas(!mostrarCanchas)}
            style={{ ...inputStyle, textAlign: "left", cursor: "pointer", marginBottom: "8px", color: cancha ? "#fff" : "#666" }}
          >
            {cancha === "otro" ? (canchaPersonalizada || "Escribí la cancha...") : cancha || "Seleccionar Cancha..."}
          </button>

          {mostrarCanchas && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px", overflow: "hidden", maxHeight: "200px", overflowY: "auto" }}>
              {rivales.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setCancha(r.nombre); setMostrarCanchas(false); }}
                  style={{ width: "100%", padding: "12px 16px", background: cancha === r.nombre ? "#2e2e2e" : "transparent", border: "none", borderBottom: "1px solid #2e2e2e", color: "#fff", fontSize: "14px", textAlign: "left", cursor: "pointer" }}
                >
                  {r.nombre}
                </button>
              ))}
              <button
                onClick={() => { setCancha("otro"); setMostrarCanchas(false); }}
                style={{ width: "100%", padding: "12px 16px", background: "transparent", border: "none", color: "#aaa", fontSize: "14px", textAlign: "left", cursor: "pointer" }}
              >
                Otro...
              </button>
            </div>
          )}

          {cancha === "otro" && (
            <input
              value={canchaPersonalizada}
              onChange={(e) => setCanchaPersonalizada(e.target.value)}
              placeholder="Escribí el nombre de la cancha..."
              style={{ ...inputStyle, marginBottom: "16px" }}
            />
          )}

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Fecha</p>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            style={{ ...inputStyle, marginBottom: "16px", color: fecha ? "#fff" : "#666" }}
          />

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Hora</p>
          <button
            onClick={() => setMostrarHora(!mostrarHora)}
            style={{ ...inputStyle, textAlign: "left", cursor: "pointer", marginBottom: "8px" }}
          >
            {hora.hora}:{hora.minutos} HS
          </button>

          {mostrarHora && (
            <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "16px", overflow: "hidden" }}>
              <Picker value={hora} onChange={setHora} wheelMode="normal" height={150}>
                <Picker.Column name="hora">
                  {HORAS.map((h) => (
                    <Picker.Item key={h} value={h}>
                      {({ selected }) => (
                        <div style={{ color: selected ? "#fff" : "#555", fontWeight: selected ? 700 : 400, fontSize: selected ? "20px" : "16px", padding: "4px 0" }}>
                          {h}
                        </div>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
                <Picker.Column name="minutos">
                  {MINUTOS.map((m) => (
                    <Picker.Item key={m} value={m}>
                      {({ selected }) => (
                        <div style={{ color: selected ? "#fff" : "#555", fontWeight: selected ? 700 : 400, fontSize: selected ? "20px" : "16px", padding: "4px 0" }}>
                          {m}
                        </div>
                      )}
                    </Picker.Item>
                  ))}
                </Picker.Column>
              </Picker>
              <button
                onClick={() => setMostrarHora(false)}
                style={{ width: "100%", padding: "12px", background: "#2e2e2e", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600 }}
              >
                Confirmar
              </button>
            </div>
          )}

          <p style={{ color: "#888", fontSize: "13px", marginBottom: "6px" }}>Observaciones (opcional)</p>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Llevar canilleras, DNI, etc."
            rows={3}
            style={{ ...inputStyle, resize: "none", marginBottom: "16px" }}
          />
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
          <button
            onClick={() => { if (rivalId && fecha && (cancha !== "otro" || canchaPersonalizada)) setPantalla("citados"); }}
            style={{ width: "100%", padding: "16px", background: rivalId && fecha && (cancha !== "otro" || canchaPersonalizada) ? "#16a34a" : "#2e2e2e", border: "none", borderRadius: "12px", color: rivalId && fecha ? "#fff" : "#666", fontSize: "16px", fontWeight: 700 }}
          >
            CONTINUAR A CITADOS
          </button>
        </div>
      </div>
    );
  }

  if (pantalla === "citados") {
    return (
      <div style={pageStyle}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          {botonVolver(() => setPantalla("configurar"))}
          <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "20px", color: "#fff" }}>
            CITACIÓN: {categoriaSeleccionada.label.toUpperCase()}
          </h1>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {jugadores.map((jugador) => {
              const citado = citados[jugador.id];
              return (
                <div
                  key={jugador.id}
                  style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <button
                    onClick={() => navigate(`/gestion/ficha/${jugador.id}`)}
                    style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2e2e2e", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {fotos[jugador.id] ? (
                      <img src={fotos[jugador.id]} alt="foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5">
                        <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                      </svg>
                    )}
                  </button>
                  <span style={{ flex: 1, color: "#fff", fontSize: "14px", fontWeight: 600, textTransform: "uppercase" }}>
                    {jugador.NOMBRE} {jugador.APELLIDO}
                  </span>
                  <div
                    onClick={() => setCitados((prev) => ({ ...prev, [jugador.id]: !prev[jugador.id] }))}
                    style={{ width: "48px", height: "26px", borderRadius: "13px", background: citado ? "#16a34a" : "#333", display: "flex", alignItems: "center", padding: "3px", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transform: citado ? "translateX(22px)" : "translateX(0)", transition: "transform 0.2s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "12px 16px 16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
          <p style={{ color: "#16a34a", fontWeight: 700, fontSize: "15px", marginBottom: "10px", textAlign: "center" }}>
            JUGADORES ELEGIDOS: {totalCitados}
          </p>
          <button
            onClick={() => setPantalla("pdf")}
            disabled={totalCitados === 0}
            style={{ width: "100%", padding: "16px", background: totalCitados > 0 ? "#fff" : "#2e2e2e", border: "none", borderRadius: "12px", color: totalCitados > 0 ? "#111" : "#666", fontSize: "16px", fontWeight: 700 }}
          >
            GENERAR Y COMPARTIR PDF
          </button>
        </div>
      </div>
    );
  }

  if (pantalla === "pdf") {
    const jugadoresCitados = jugadores.filter((j) => citados[j.id]);
    return (
      <PlacaConvocatoria
        categoria={categoriaSeleccionada.label}
        rival={rivalNombre}
        escudoRival={rivalEscudo}
        cancha={cancha === "otro" ? canchaPersonalizada : cancha}
        fecha={fecha}
        hora={`${hora.hora}:${hora.minutos}`}
        observaciones={observaciones}
        jugadoresCitados={jugadoresCitados}
        fotos={fotos}
        onVolver={() => setPantalla("citados")}
      />
    );
  }

  return null;
}