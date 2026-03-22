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
              
              <div style={{ width: "300px", padding: "30px 25px", display: "flex", flexDirection: "column", justifyContent: "space-between", flexShrink: 0 }}>
                <div>
                  <p style={{ margin: 0, fontSize: "13px", fontWeight: 300, letterSpacing: "1px", color: "#fff" }}>CONVOCATORIA:</p>
                  <h1 style={{ margin: "0 0 12px 0", fontSize: "30px", fontWeight: 900, color: "#fff" }}>{categoriaCorta}</h1>
                  {images.union && <img src={images.union} style={{ width: "90px", marginBottom: "14px" }} />}
                  <h2 style={{ fontSize: "20px", margin: "0 0 8px 0", color: "#fff" }}>Vs. {rival}</h2>
                  {images.rival && <img src={images.rival} style={{ height: "100px", width: "auto", objectFit: "contain", marginBottom: "12px" }} />}
                  <p style={{ fontSize: "13px", color: "#ccc", margin: "4px 0" }}>{fecha} - {hora} HS</p>
                  <p style={{ fontSize: "13px", color: "#ccc", margin: "4px 0" }}>Cancha: {cancha}</p>
                </div>
                {observaciones && <p style={{ fontSize: "18px", color: "#ccc", fontStyle: "normal" }}>{observaciones}</p>}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "20px", paddingRight: "30px", paddingLeft: "10px", overflow: "hidden"  }}>
                {filas.map((fila, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "center", gap: "18px" }}>
                    {fila.map(j => (
                      <div key={j.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "80px" }}>
                        <div style={{ position: "relative", width: "62px", height: "62px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,255,255,0.8)", background: "#222", flexShrink: 0 }}>
                          {images.pibes[j.id] ? (
                            <img src={images.pibes[j.id]} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#888", fontSize: "20px" }}>?</div>
                          )}
                        </div>
                        <p style={{ fontSize: "10px", marginTop: "6px", fontWeight: "bold", textAlign: "center", textTransform: "uppercase", color: "#fff", wordBreak: "break-word", maxWidth: "80px" }}>
                          {j.APELLIDO}
                        </p>
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
            DESCARGAR PDF
          </button>
        </div>
      )}
    </div>
  );
}