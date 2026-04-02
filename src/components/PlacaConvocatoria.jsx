import { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

async function imageToBase64(url) {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error cargando imagen:", url, error);
    return null;
  }
}

export default function PlacaConvocatoria({ categoria, rival, escudoRival, cancha, fecha, hora, observaciones, jugadoresCitados, fotos, onVolver }) {
  const placaRef = useRef(null);
  const [images, setImages] = useState({ fondo: null, union: null, rival: null, pibes: {} });
  const [cargando, setCargando] = useState(true);

  const categoriaCorta = categoria.replace(/.* - /, "").replace("Categoría ", "").toUpperCase();

  useEffect(() => {
    const cargarTodo = async () => {
      const [fondo, union, rivalImg] = await Promise.all([
        imageToBase64("/images/fondo_cancha_futbol.jpg"),
        imageToBase64("/images/unionas_escudo.png"),
        escudoRival ? imageToBase64(escudoRival) : Promise.resolve(null),
      ]);

      const pibesB64 = {};
      for (const j of jugadoresCitados) {
        if (fotos[j.id]) pibesB64[j.id] = await imageToBase64(fotos[j.id]);
      }

      setImages({ fondo, union, rival: rivalImg, pibes: pibesB64 });
      setCargando(false);
    };
    cargarTodo();
  }, [jugadoresCitados, fotos, escudoRival]);

  const descargarPDF = async () => {
    const elemento = placaRef.current;
    const canvas = await html2canvas(elemento, { 
      scale: 2, 
      useCORS: true,
      width: 900,
      height: 506,
      windowWidth: 900,
    });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [900, 506] });
    pdf.addImage(imgData, "JPEG", 0, 0, 900, 506);
    pdf.save(`Convocatoria_${categoriaCorta}_${rival}.pdf`);
  };

  // --- VOLVEMOS A 6 POR FILA ---
  const filas = [];
  for (let i = 0; i < jugadoresCitados.length; i += 6) {
    filas.push(jugadoresCitados.slice(i, i + 6));
  }

  return (
    <div style={{ background: "#111", minHeight: "100vh", padding: "16px", overflowX: "auto" }}>
      <button onClick={onVolver} style={{ background: "#333", border: "none", color: "white", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", marginBottom: "20px" }}>
        ← Volver
      </button>

      {cargando ? (
        <p style={{ textAlign: 'center', color: "#666" }}>Cargando diseño...</p>
      ) : (
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div
            ref={placaRef}
            style={{
              position: "relative",
              width: "900px",
              height: "506px",
              backgroundColor: "#000",
              overflow: "hidden",
              display: "flex",
              borderRadius: "4px",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <img src={images.fondo} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", width: "100%", height: "100%", background: "rgba(0,0,0,0.65)" }} />

            <div style={{ position: "relative", zIndex: 10, display: "flex", width: "100%", height: "100%" }}>
              
              <div style={{ width: "270px", padding: "25px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: "11px", fontWeight: 300, letterSpacing: "1px", color: "#fff" }}>CONVOCATORIA:</p>
                  <h1 style={{ margin: "0 0 10px 0", fontSize: "28px", fontWeight: 900, color: "#fff" }}>{categoriaCorta}</h1>
                  {images.union && <img src={images.union} style={{ width: "80px", marginBottom: "12px" }} />}
                  <h2 style={{ fontSize: "18px", margin: "0 0 6px 0", color: "#fff" }}>Vs. {rival}</h2>
                  {images.rival && <img src={images.rival} style={{ height: "80px", width: "auto", objectFit: "contain", marginBottom: "10px" }} />}
                  <p style={{ fontSize: "12px", color: "#ccc", margin: "3px 0" }}>{fecha} - {hora} HS</p>
                  <p style={{ fontSize: "12px", color: "#ccc", margin: "3px 0" }}>Cancha: {cancha}</p>
                </div>
                {observaciones && (
                  <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px", borderRadius: "6px" }}>
                    <p style={{ fontSize: "14px", color: "#fff", margin: 0, fontStyle: "italic" }}>{observaciones}</p>
                  </div>
                )}
              </div>

              {/* GRILLA DE 6 JUGADORES */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", paddingRight: "20px", overflow: "hidden" }}>
                {filas.map((fila, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                    {fila.map(j => (
                      <div key={j.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "90px" }}>
                        <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", border: "2px solid #fff", background: "#222", flexShrink: 0, marginBottom: "6px" }}>
                          {images.pibes[j.id] ? (
                            <img src={images.pibes[j.id]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: "18px" }}>👤</div>
                          )}
                        </div>
                        
                        <div style={{ textAlign: "center", width: "100%" }}>
                          <p style={{ 
                            fontSize: "11px", 
                            fontWeight: "900", 
                            color: "#fff", 
                            textTransform: "uppercase",
                            margin: 0,
                            lineHeight: "1.1"
                          }}>
                            {j.APELLIDO}
                          </p>
                          <p style={{ 
                            fontSize: "8.5px", 
                            fontWeight: "400", 
                            color: "rgba(255,255,255,0.7)", 
                            textTransform: "capitalize",
                            margin: "1px 0 0 0"
                          }}>
                            {j.NOMBRE.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={descargarPDF}
            style={{ width: "100%", padding: "18px", marginTop: "20px", background: "white", color: "black", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "16px", cursor: "pointer" }}
          >
            GENERAR PLACA DE CONVOCATORIA
          </button>
        </div>
      )}
    </div>
  );
}