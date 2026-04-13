import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import Navbar from "../../components/Navbar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIAS = [
  { label: "Escuelita (2020/2021)", valor: "2020,2021", años: [2020, 2021] },
  { label: "Categoría 2019", valor: "2019", años: [2019] },
  { label: "Categoría 2018", valor: "2018", años: [2018] },
  { label: "Categoría 2017", valor: "2017", años: [2017] },
  { label: "Categoría 2016", valor: "2016", años: [2016] },
  { label: "Categoría 2015", valor: "2015", años: [2015] },
  { label: "Categoría 2014", valor: "2014", años: [2014] },
  { label: "2013 - Séptima", valor: "2013", años: [2013] },
  { label: "2012 - Sexta", valor: "2012", años: [2012] },
  { label: "2011/2010 - Quinta", valor: "2011,2010", años: [2011, 2010] },
  { label: "2009/2008 - Cuarta", valor: "2009,2008", años: [2009, 2008] },
];

export default function PlanillaAsistencias() {
  const [pantalla, setPantalla] = useState("categorias");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [jugadores, setJugadores] = useState([]);

  // --- FUNCIÓN CLAVE: Convierte cualquier fecha (02-04 o 02/04/2026) en un objeto Date para comparar ---
  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return new Date(0);
    // Reemplaza guiones por barras para unificar y separa
    const partes = fechaStr.replace(/-/g, "/").split("/");
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1; // Enero es 0
    const año = partes[2] ? parseInt(partes[2]) : 2026; // Si no tiene año, asume 2026
    return new Date(año, mes, dia);
  };

  // --- FUNCIÓN PARA MOSTRAR: Siempre devuelve DD/MM ---
  const formatoCorto = (fechaStr) => {
    if (!fechaStr) return "S/F";
    const partes = fechaStr.replace(/-/g, "/").split("/");
    return `${partes[0].padStart(2, "0")}/${partes[1].padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!categoriaSeleccionada) return;
    const fetchData = async () => {
      // 1. Cargar Asistencias
      const snapAs = await getDocs(collection(db, "ASISTENCIAS"));
      const todas = snapAs.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((a) => a.categoria === categoriaSeleccionada.valor)
        // ORDENAMIENTO CRONOLÓGICO TOTAL
        .sort((a, b) => normalizarFecha(a.fecha) - normalizarFecha(b.fecha));
      
      setAsistencias(todas);

      // 2. Cargar Jugadores
      const snapJug = await getDocs(collection(db, "JUGADORES"));
      const lista = snapJug.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((j) => {
          const fechaNac = j["FECHA NACIMIENTO"] || "";
          const partes = fechaNac.replace(/-/g, "/").split("/");
          const año = parseInt(partes[2]);
          return categoriaSeleccionada.años.includes(año);
        })
        .sort((a, b) => (a.APELLIDO || "").localeCompare(b.APELLIDO || ""));
      
      setJugadores(lista);
    };
    fetchData();
  }, [categoriaSeleccionada]);

  const estaPresente = (jugador, asistencia) => {
    const nombreCompleto = `${jugador.NOMBRE} ${jugador.APELLIDO}`.toUpperCase().trim();
    // Buscamos en el array 'presentes' o campos sueltos (como hacíamos en cobranzas)
    const listado = [
        ...(asistencia.presentes || []),
        ...Object.values(asistencia).filter(v => typeof v === 'string' && v.length > 5 && v !== asistencia.fecha)
    ].map(n => n.toUpperCase().trim());
    
    return listado.includes(nombreCompleto);
  };

  const exportarPDF = () => {
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Planilla de Asistencias - ${categoriaSeleccionada.label}`, 14, 15);

    const columnas = [
      { header: "JUGADOR", dataKey: "jugador" },
      ...asistencias.map((a) => ({
        header: formatoCorto(a.fecha),
        dataKey: a.id,
      })),
    ];

    const filas = jugadores.map((jugador) => {
      const fila = { jugador: `${jugador.APELLIDO}, ${jugador.NOMBRE}` };
      asistencias.forEach((a) => {
        fila[a.id] = estaPresente(jugador, a) ? "P" : "A";
      });
      return fila;
    });

    autoTable(pdf, {
      startY: 22,
      columns: columnas,
      body: filas,
      theme: "grid",
      headStyles: { fillColor: [30, 30, 30], halign: "center", fontSize: 8 },
      bodyStyles: { fontSize: 8, halign: "center" },
      columnStyles: { jugador: { halign: "left", cellWidth: 45, fontStyle: "bold" } },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.dataKey !== "jugador") {
          if (data.cell.raw === "P") {
            data.cell.styles.textColor = [22, 163, 74];
          } else {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
    });

    pdf.save(`Asistencias_${categoriaSeleccionada.label}.pdf`);
  };

  // --- VISTA DE SELECCIÓN DE CATEGORÍAS ---
  if (pantalla === "categorias") {
    return (
      <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "40px" }}>
        <Navbar />
        <div style={{ padding: "24px 16px" }}>
          <button onClick={() => window.history.back()} style={styles.btnAtras}>← Atrás</button>
          <h1 style={styles.tituloHeader}>Seleccioná Categoría</h1>
          
          <p style={styles.subtitulo}>Infantiles</p>
          {CATEGORIAS.slice(0, 7).map((cat) => (
            <button key={cat.valor} onClick={() => { setCategoriaSeleccionada(cat); setPantalla("planilla"); }} style={styles.btnCat}>
              {cat.label} <span>›</span>
            </button>
          ))}

          <p style={{ ...styles.subtitulo, marginTop: "20px" }}>Juveniles</p>
          {CATEGORIAS.slice(7).map((cat) => (
            <button key={cat.valor} onClick={() => { setCategoriaSeleccionada(cat); setPantalla("planilla"); }} style={styles.btnCat}>
              {cat.label} <span>›</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA DE LA PLANILLA (TABLA) ---
  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <button onClick={() => setPantalla("categorias")} style={styles.btnAtras}>← Categorías</button>
        <h1 style={styles.tituloPlanilla}>{categoriaSeleccionada.label}</h1>

        {asistencias.length === 0 ? (
          <p style={{ color: "#666", textAlign: "center", marginTop: "40px" }}>No hay entrenamientos registrados.</p>
        ) : (
          <div style={{ overflowX: "auto", background: "#1a1a1a", borderRadius: "15px", border: "1px solid #333" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#222" }}>
                  <th style={styles.thJugador}>JUGADOR</th>
                  {asistencias.map((a) => (
                    <th key={a.id} style={styles.thFecha}>{formatoCorto(a.fecha)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador) => (
                  <tr key={jugador.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={styles.tdNombre}>{jugador.APELLIDO}, {jugador.NOMBRE}</td>
                    {asistencias.map((a) => (
                      <td key={a.id} style={styles.tdCheck}>
                        {estaPresente(jugador, a) ? 
                          <span style={{ color: "#16a34a" }}>✓</span> : 
                          <span style={{ color: "#dc2626" }}>✗</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <button onClick={exportarPDF} style={styles.btnPdf}>EXPORTAR PLANILLA PDF</button>
      </div>
    </div>
  );
}

const styles = {
  btnAtras: { background: "#1e1e1e", border: "1px solid #333", borderRadius: "10px", color: "#fff", fontSize: "12px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" },
  tituloHeader: { fontSize: "24px", fontWeight: "900", color: "#fff", marginBottom: "20px" },
  subtitulo: { color: "#555", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "10px" },
  btnCat: { width: "100%", padding: "18px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "12px", color: "#fff", fontSize: "14px", textAlign: "left", display: "flex", justifyContent: "space-between", marginBottom: "8px" },
  tituloPlanilla: { fontSize: "20px", fontWeight: "900", color: "#fff", marginBottom: "20px" },
  thJugador: { padding: "15px", textAlign: "left", color: "#aaa", fontSize: "11px", position: "sticky", left: 0, background: "#222", zIndex: 2 },
  thFecha: { padding: "12px", color: "#aaa", fontSize: "11px", borderLeft: "1px solid #333" },
  tdNombre: { padding: "12px 15px", color: "#fff", fontSize: "12px", fontWeight: "bold", position: "sticky", left: 0, background: "#1a1a1a", borderRight: "1px solid #333" },
  tdCheck: { textAlign: "center", fontSize: "16px", fontWeight: "bold", borderLeft: "1px solid #222" },
  footer: { position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#111", borderTop: "1px solid #333" },
  btnPdf: { width: "100%", padding: "16px", background: "#33b5e5", border: "none", borderRadius: "12px", color: "#000", fontSize: "14px", fontWeight: "900" }
};