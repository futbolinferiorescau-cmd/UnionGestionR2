import { useState, useEffect } from "react";
import { db } from "../../firebase"; 
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../../components/Navbar";
import BottomNav from "../../components/BottomNav";

export default function Planificacion() {
  const [semana, setSemana] = useState(10);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [imagenExpandida, setImagenExpandida] = useState(null);

  const obtenerRangoFechas = (num) => {
    const fechaBase = new Date(2026, 3, 6); 
    const diasDeDiferencia = (num - 10) * 7;
    const lunes = new Date(fechaBase);
    lunes.setDate(fechaBase.getDate() + diasDeDiferencia);
    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);
    return `del ${lunes.getDate()} al ${viernes.getDate()} de ${lunes.toLocaleDateString('es-AR', { month: 'long' })}`;
  };

  useEffect(() => {
    const obtenerPlan = async () => {
      setCargando(true);
      try {
        const docRef = doc(db, "planificaciones", `Semana_${semana}`);
        const docSnap = await getDoc(docRef);
        setDatos(docSnap.exists() ? docSnap.data() : null);
      } catch { setDatos(null); }
      setCargando(false);
    };
    obtenerPlan();
  }, [semana]);

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />
      
      <div style={{ padding: "20px 16px" }}>
        {/* TÍTULO BLANCO PURO */}
        <h1 style={{ 
          fontSize: "28px", 
          fontWeight: "900", 
          color: "#FFFFFF", 
          marginBottom: "5px",
          textTransform: "uppercase"
        }}>
          Planificación
        </h1>
        
        <p style={{ fontSize: "14px", color: "#16a34a", fontWeight: "bold", marginBottom: "20px" }}>
          Semana {semana}: {obtenerRangoFechas(semana)}
        </p>

        {/* SELECTOR DE SEMANA */}
        <div style={selectorStyle}>
          <button onClick={() => setSemana(s => Math.max(1, s - 1))} style={btnStyle}>◀</button>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "#666", display: "block" }}>SEMANA</span>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#fff" }}>{semana}</span>
          </div>
          <button onClick={() => setSemana(s => s + 1)} style={btnStyle}>▶</button>
        </div>

        {cargando ? (
          <p style={{ textAlign: "center", color: "#555" }}>Cargando...</p>
        ) : datos ? (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#fff", marginBottom: "5px" }}>{datos.titulo}</h2>
            <p style={{ color: "#bbb", fontSize: "14px", marginBottom: "20px" }}>{datos.descripcion}</p>
            
            {/* IMAGEN PRINCIPAL (CRONOGRAMA) */}
            <div onClick={() => setImagenExpandida(datos.imagenUrl)} style={cardImagenStyle}>
              <img src={datos.imagenUrl} alt="Plan" style={{ width: "100%", display: "block" }} />
              <div style={zoomTagStyle}>🔍 AMPLIAR</div>
            </div>

            {/* CARRUSEL DE EJERCICIOS (SCROLL HORIZONTAL) */}
            {datos.ejercicios && datos.ejercicios.length > 0 && (
              <div style={{ marginTop: "30px" }}>
                <h3 style={{ fontSize: "16px", color: "#16a34a", marginBottom: "15px", fontWeight: "bold", textTransform: "uppercase" }}>
                  Ejercicios Específicos
                </h3>
                
                {/* CONTENEDOR CON SCROLL */}
                <div style={{ 
                  display: "flex", 
                  overflowX: "auto", 
                  gap: "14px", 
                  paddingBottom: "15px", // Espacio para que no se corte el borde abajo
                  WebkitOverflowScrolling: "touch" // Scroll suave en iPhone
                }}>
                  {datos.ejercicios.map((url, i) => (
                    <div 
                      key={i} 
                      onClick={() => setImagenExpandida(url)}
                      style={{
                        flex: "0 0 180px",       // No se achican y miden 180px de ancho
                        background: "#222",
                        padding: "4px",
                        borderRadius: "14px",
                        border: "2px solid #555",
                        cursor: "pointer",
                        overflow: "hidden"
                      }}
                    >
                      <img 
                        src={url} 
                        style={{ 
                          width: "100%", 
                          aspectRatio: "1/1", 
                          objectFit: "cover", 
                          borderRadius: "10px",
                          display: "block"
                        }} 
                      />
                    </div>
                  ))}
                </div>
                <p style={{ color: "#444", fontSize: "10px", textAlign: "center" }}> deslizar para ver más →</p>
              </div>
            )}
          </div>
        ) : (
          <div style={emptyStyle}>No hay datos para la semana {semana}.</div>
        )}
      </div>

      {/* MODAL ZOOM */}
      {imagenExpandida && (
        <div onClick={() => setImagenExpandida(null)} style={modalStyle}>
          <img src={imagenExpandida} style={{ maxWidth: "95%", maxHeight: "85%", borderRadius: "10px", border: "3px solid #fff" }} />
          <p style={{ color: "#fff", marginTop: "20px", fontWeight: "bold" }}>CERRAR</p>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

// ESTILOS DE APOYO
const selectorStyle = { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#1e1e1e", padding: "10px 20px", borderRadius: "15px", marginBottom: "25px", border: "1px solid #333" };
const btnStyle = { background: "#333", color: "#fff", border: "none", borderRadius: "50%", width: "45px", height: "45px", fontSize: "18px" };
const cardImagenStyle = { position: "relative", borderRadius: "15px", overflow: "hidden", border: "2px solid #555", cursor: "pointer" };
const zoomTagStyle = { position: "absolute", bottom: "10px", right: "10px", background: "rgba(0,0,0,0.8)", padding: "5px 12px", borderRadius: "8px", fontSize: "10px", color: "#fff", fontWeight: "bold" };
const emptyStyle = { textAlign: "center", padding: "60px 20px", color: "#444", border: "2px dashed #222", borderRadius: "20px" };
const modalStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.98)", zIndex: 3000, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" };