import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../../firebase";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getStorage } from "firebase/storage";

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

export default function FichaJugador() {
  const { dni } = useParams();
  const navigate = useNavigate();
  const [jugador, setJugador] = useState(null);
  const [tutor, setTutor] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const fileInputRef = useRef(null);
  const storage = getStorage();

  useEffect(() => {
    const fetchJugador = async () => {
      const docRef = doc(db, "JUGADORES", dni);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setJugador(data);
        setTutor(data.TUTOR || "");
        setTelefono(data.TELEFONO || "");
        const extensiones = [".jpg", ".jpeg", ".png"];
        for (const ext of extensiones) {
          try {
            const url = await getDownloadURL(
              ref(storage, `fotos_jugadores/${dni}${ext}`)
            );
            setFotoUrl(url);
            break;
          } catch {
            continue;
          }
        }
      }
    };
    fetchJugador();
  }, [dni]);

  const guardarCambios = async () => {
    setGuardando(true);
    await updateDoc(doc(db, "JUGADORES", dni), {
      TUTOR: tutor,
      TELEFONO: telefono,
    });
    setGuardando(false);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 2000);
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);
    const ext = file.name.split(".").pop();
    const storageRef = ref(storage, `fotos_jugadores/${dni}.${ext}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    setFotoUrl(url);
    await updateDoc(doc(db, "JUGADORES", dni), { FOTO: `${dni}.${ext}` });
    setSubiendo(false);
  };

  if (!jugador) {
    return (
      <div style={{ background: "#111", minHeight: "100vh" }}>
        <Navbar />
        <div style={{ padding: "24px 16px", color: "#666" }}>Cargando...</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "40px" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}
        >
          ← Volver
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ position: "relative", marginBottom: "12px" }}>
            <div style={{ width: "110px", height: "110px", borderRadius: "50%", background: "#2e2e2e", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {fotoUrl ? (
                <img src={fotoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="50" height="50" viewBox="0 0 16 16" fill="none" stroke="#666" strokeWidth="1">
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{ position: "absolute", bottom: 0, right: 0, width: "32px", height: "32px", borderRadius: "50%", background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#111" strokeWidth="1.5">
                <path d="M1 11V14h3l8-8-3-3L1 11z" />
                <path d="M11 3l2 2" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFoto}
              style={{ display: "none" }}
            />
          </div>
          {subiendo && <p style={{ color: "#666", fontSize: "13px" }}>Subiendo foto...</p>}
          <h1 style={{ fontSize: "22px", fontWeight: 700, textAlign: "center", color: "#fff" }}>
            {jugador.NOMBRE} {jugador.APELLIDO}
          </h1>
          <p style={{ color: "#666", fontSize: "14px" }}>
            {getCategoria(jugador["FECHA NACIMIENTO"])}
          </p>
        </div>

        <p style={{ color: "#555", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
          Datos personales
        </p>
        <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "24px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #2e2e2e" }}>
            <span style={{ color: "#aaa", fontSize: "14px" }}>DNI</span>
            <span style={{ color: "#fff", fontSize: "14px" }}>{jugador.DNI}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px" }}>
            <span style={{ color: "#aaa", fontSize: "14px" }}>Fecha Nac.</span>
            <span style={{ color: "#fff", fontSize: "14px" }}>{jugador["FECHA NACIMIENTO"]}</span>
          </div>
        </div>

        <p style={{ color: "#555", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px" }}>
          Contacto
        </p>
        <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "24px", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #2e2e2e" }}>
            <span style={{ color: "#aaa", fontSize: "14px" }}>Padre/Tutor</span>
            <input
              value={tutor}
              onChange={(e) => setTutor(e.target.value)}
              placeholder="Sin datos"
              style={{ background: "none", border: "none", color: "#fff", fontSize: "14px", textAlign: "right", outline: "none", width: "60%" }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
            <span style={{ color: "#aaa", fontSize: "14px" }}>Teléfono</span>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Sin datos"
              type="tel"
              style={{ background: "none", border: "none", color: "#fff", fontSize: "14px", textAlign: "right", outline: "none", width: "60%" }}
            />
          </div>
        </div>

        <button
          onClick={guardarCambios}
          disabled={guardando || guardado}
          style={{ width: "100%", padding: "16px", background: guardado ? "#16a34a" : "#fff", border: "none", borderRadius: "12px", color: "#111", fontSize: "16px", fontWeight: 700 }}
        >
          {guardando ? "Guardando..." : guardado ? "✓ Guardado" : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}