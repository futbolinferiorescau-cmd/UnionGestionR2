import { useEffect, useState } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function getCategoria(fechaNacimiento) {
  const año = parseInt(fechaNacimiento.split("/")[2]);
  if (año >= 2020) return "Escuelita (2020/2021)";
  if (año === 2019) return "Categoría 2019";
  if (año === 2018) return "Categoría 2018";
  if (año === 2017) return "Categoría 2017";
  if (año === 2016) return "Categoría 2016";
  if (año === 2015) return "Categoría 2015";
  if (año === 2014) return "Categoría 2014";
  if (año === 2013) return "2013 - Séptima";
  if (año === 2012) return "2012 - Sexta";
  if (año === 2011 || año === 2010) return "2011/2010 - Quinta";
  if (año === 2009 || año === 2008) return "2009/2008 - Cuarta";
  return "Sin categoría";
}

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

export default function Asistencias() {
  const [pantalla, setPantalla] = useState("categorias");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [estados, setEstados] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const navigate = useNavigate();

  const hoy = new Date();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`
  );
  const fechaObj = new Date(fechaSeleccionada + "T00:00:00");
  const fechaTexto = fechaObj.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const fechaId = `${fechaObj.getDate()}-${fechaObj.getMonth() + 1}-${fechaObj.getFullYear()}`;

  useEffect(() => {
    if (!categoriaSeleccionada) return;
    const fetchJugadores = async () => {
      const querySnapshot = await getDocs(collection(db, "JUGADORES"));
      const lista = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((j) => {
          const año = parseInt(j["FECHA NACIMIENTO"].split("/")[2]);
          return categoriaSeleccionada.años.includes(año);
        })
        .sort((a, b) => a.APELLIDO.localeCompare(b.APELLIDO));
      setJugadores(lista);
      const estadosIniciales = {};
      lista.forEach((j) => { estadosIniciales[j.id] = false; });
      setEstados(estadosIniciales);
    };
    fetchJugadores();
  }, [categoriaSeleccionada]);

  const toggleEstado = (id) => {
    setEstados((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const confirmarAsistencia = async () => {
    setGuardando(true);
    const presentes = jugadores.filter((j) => estados[j.id]).map((j) => `${j.NOMBRE} ${j.APELLIDO}`);
    const ausentes = jugadores.filter((j) => !estados[j.id]).map((j) => `${j.NOMBRE} ${j.APELLIDO}`);
    const docId = `${fechaId}_${categoriaSeleccionada.años.join(",")}`;
    await setDoc(doc(db, "ASISTENCIAS", docId), {
      fecha: `${fechaObj.getDate()}/${fechaObj.getMonth() + 1}/${fechaObj.getFullYear()}`,
      categoria: categoriaSeleccionada.años.join(","),
      presentes,
      ausentes,
    });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => { setGuardado(false); setPantalla("categorias"); }, 2000);
  };

  if (pantalla === "categorias") {
    return (
      <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "40px" }}>
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
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Infantiles</p>
            {CATEGORIAS.slice(0, 7).map((cat) => (
              <button
                key={cat.label}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("asistencia"); }}
                style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                {cat.label}
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#333", border: "2px solid #555" }} />
              </button>
            ))}
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Juveniles</p>
            {CATEGORIAS.slice(7).map((cat) => (
              <button
                key={cat.label}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("asistencia"); }}
                style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                {cat.label}
                <span style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#333", border: "2px solid #555" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <button
          onClick={() => setPantalla("categorias")}
          style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "12px", cursor: "pointer" }}
        >
          ← Volver
        </button>
        <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px", color: "#fff", textTransform: "uppercase" }}>
          {categoriaSeleccionada.label}
        </h1>

        <input
          type="date"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
          style={{ background: "#3a3a3a", border: "1px solid #555", borderRadius: "10px", color: "#fff", fontSize: "20px", padding: "6px 10px", marginBottom: "24px", colorScheme: "dark", width: "160px" }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {jugadores.map((jugador) => {
            const presente = estados[jugador.id];
            return (
              <div key={jugador.id} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2e2e2e", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1.5">
                    <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                  </svg>
                </div>

                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: presente ? "#16a34a" : "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "#fff" }}>{presente ? "P" : "A"}</span>
                </div>

                <button
                  onClick={() => navigate(`/gestion/ficha/${jugador.id}`)}
                  style={{ flex: 1, background: "none", border: "none", color: "#fff", fontSize: "14px", fontWeight: 600, textAlign: "left", padding: 0, textTransform: "uppercase" }}
                >
                  {jugador.NOMBRE} {jugador.APELLIDO}
                </button>

                <div
                  onClick={() => toggleEstado(jugador.id)}
                  style={{ width: "48px", height: "26px", borderRadius: "13px", background: presente ? "#16a34a" : "#333", display: "flex", alignItems: "center", padding: "3px", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}
                >
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", transform: presente ? "translateX(22px)" : "translateX(0)", transition: "transform 0.2s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
        <button
          onClick={confirmarAsistencia}
          disabled={guardando || guardado}
          style={{ width: "100%", padding: "16px", background: guardado ? "#16a34a" : "#2563eb", border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: 700 }}
        >
          {guardando ? "Guardando..." : guardado ? "✓ Asistencia Guardada" : "Confirmar Asistencia"}
        </button>
      </div>
    </div>
  );
}