import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"; 
import { db } from "../../firebase";
import { ref, getDownloadURL, getStorage, uploadBytes } from "firebase/storage";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

function getCategoria(fechaNacimiento) {
  if (!fechaNacimiento) return "Sin datos";
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
  const [compras, setCompras] = useState([]);
  const [, setGuardando] = useState(false); // Quitamos la variable no usada
  const [guardado, setGuardado] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const storage = getStorage();

  useEffect(() => {
    const fetchDatos = async () => {
      if (!dni) { navigate("/gestion/ficha"); return; }
      try {
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
              const url = await getDownloadURL(ref(storage, `fotos_jugadores/${dni}${ext}`));
              setFotoUrl(url);
              break; 
            } catch { continue; } // catch limpio
          }
        } else { setError("No se encontró el registro."); }
        const q = query(collection(db, "VENTA_MEDIAS"), where("jugadorId", "==", dni));
        const snapVentas = await getDocs(q);
        setCompras(snapVentas.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch { 
        setError("Error de conexión."); 
      }
    };
    fetchDatos();
  }, [dni, navigate, storage]);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      await updateDoc(doc(db, "JUGADORES", dni), { TUTOR: tutor.toUpperCase(), TELEFONO: telefono });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch { 
      alert("Error al guardar"); 
    }
    setGuardando(false);
  };

  const saldarDeuda = async (idVenta) => {
    if (!window.confirm("¿Confirmás el pago total?")) return;
    try {
      const ventaRef = doc(db, "VENTA_MEDIAS", idVenta);
      const ventaActual = compras.find(c => c.id === idVenta);
      await updateDoc(ventaRef, { saldo: 0, pagado: ventaActual.total });
      setCompras(compras.map(c => c.id === idVenta ? { ...c, saldo: 0, pagado: c.total } : c));
    } catch { 
      alert("Error al saldar"); 
    }
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const ext = file.name.split(".").pop();
      const storageRef = ref(storage, `fotos_jugadores/${dni}.${ext}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFotoUrl(url);
    } catch { 
      alert("Error al subir la foto"); 
    }
    setSubiendo(false);
  };

  if (error) return <div style={{color:'white', padding:'50px'}}>{error}</div>;
  if (!jugador) return <div style={{color:'white', padding:'50px'}}>Cargando...</div>;

  const deudaTotal = compras.reduce((acc, c) => acc + (c.saldo || 0), 0);

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "40px", color: "white", fontFamily: "sans-serif" }}>
      <Navbar />
      <div style={{ padding: "24px 16px", maxWidth: "500px", margin: "0 auto" }}>
        
        <button onClick={() => navigate(-1)} style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", padding: "8px 16px", marginBottom: "20px" }}>
          ← Volver
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ position: "relative", marginBottom: "12px", width: "110px", height: "110px", borderRadius: "50%", background: "#2e2e2e", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #333" }}>
            {fotoUrl ? <img src={fotoUrl} alt="F" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{fontSize:"40px", opacity:0.2}}>👤</span>}
            <button onClick={() => fileInputRef.current.click()} style={{ position: "absolute", bottom: 0, right: 0, width: "32px", height: "32px", borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer" }}>📷</button>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFoto} style={{ display: "none" }} />
          </div>
          
          <h1 style={{ fontSize: "26px", fontWeight: "900", margin: "10px 0 0", color: "#FFFFFF", textTransform: "uppercase", textAlign: "center" }}>
            {jugador.NOMBRE} {jugador.APELLIDO}
          </h1>
          <p style={{ color: "#888", fontSize: "14px", fontWeight: "bold" }}>{getCategoria(jugador["FECHA NACIMIENTO"])}</p>
          {subiendo && <p style={{color: "#4CD964", fontSize: "12px", marginTop: "5px"}}>Subiendo foto...</p>}
        </div>

        <p style={{ color: "#fff", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>Datos personales</p>
        <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "24px", padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}><span style={{color:"#888"}}>DNI</span><span style={{fontWeight:"bold"}}>{jugador.DNI}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{color:"#888"}}>Nacimiento</span><span style={{fontWeight:"bold"}}>{jugador["FECHA NACIMIENTO"]}</span></div>
        </div>

        <p style={{ color: "#fff", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>Contacto</p>
        <div style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", marginBottom: "24px", padding: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{color:"#888"}}>Tutor</span>
            <input value={tutor} onChange={(e) => setTutor(e.target.value)} style={{ background: "none", border: "none", color: "#fff", textAlign: "right", fontWeight: "bold", outline: "none" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{color:"#888"}}>Teléfono</span>
            <input value={telefono} onChange={(e) => setTelefono(e.target.value)} style={{ background: "none", border: "none", color: "#fff", textAlign: "right", fontWeight: "bold", outline: "none" }} />
          </div>
        </div>

        <button onClick={guardarCambios} style={{ width: "100%", padding: "16px", background: guardado ? "#4CD964" : "#fff", borderRadius: "12px", color: "#111", fontWeight: "900", marginBottom: "30px", border: "none", cursor: "pointer" }}>
          {guardado ? "✓ GUARDADO" : "GUARDAR CONTACTO"}
        </button>

        <p style={{ color: "#fff", fontSize: "11px", textTransform: "uppercase", marginBottom: "8px", fontWeight: "800", letterSpacing: "1px" }}>Control de Medias</p>
        <div style={{ background: "#1e1e1e", border: "2px solid", borderColor: deudaTotal > 0 ? "#FF9500" : "#4CD964", borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "15px" }}>
           <span style={{color: "#aaa", fontSize: "12px", fontWeight: "bold"}}>DEUDA TOTAL</span>
           <h2 style={{margin: 0, color: deudaTotal > 0 ? "#FF9500" : "#4CD964", fontSize: "36px", fontWeight: "900"}}>${deudaTotal}</h2>
        </div>

        {compras.map(c => (
          <div key={c.id} style={{ background: "#1e1e1e", padding: "15px", borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", border: "1px solid #222" }}>
            <div>
              <p style={{margin:0, fontSize:"14px", fontWeight:"bold", color: "#fff"}}>{c.tipo} x{c.cantidad}</p>
              <p style={{margin:0, fontSize:"11px", color:"#666"}}>Entregó: ${c.pagado}</p>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:"10px"}}>
              <span style={{fontWeight:"900", color: c.saldo > 0 ? "#FF3B30" : "#4CD964", fontSize: "14px"}}>{c.saldo > 0 ? `$${c.saldo}` : "PAGADO"}</span>
              {c.saldo > 0 && (
                <button onClick={() => saldarDeuda(c.id)} style={{background: "#4CD964", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", fontSize: "11px", cursor: "pointer"}}>PAGAR</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}