import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!categoriaSeleccionada) return;
    const fetchData = async () => {
      const snapAs = await getDocs(collection(db, "ASISTENCIAS"));
      const todas = snapAs.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((a) => a.categoria === categoriaSeleccionada.valor)
        .sort((a, b) => {
          const [da, ma] = a.fecha.split("/").map(Number);
          const [db2, mb] = b.fecha.split("/").map(Number);
          return ma !== mb ? ma - mb : da - db2;
        });
      setAsistencias(todas);

      const snapJug = await getDocs(collection(db, "JUGADORES"));
      const lista = snapJug.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((j) => {
          const año = parseInt(j["FECHA NACIMIENTO"].split("/")[2]);
          return categoriaSeleccionada.años.includes(año);
        })
        .sort((a, b) => a.APELLIDO.localeCompare(b.APELLIDO));
      setJugadores(lista);
    };
    fetchData();
  }, [categoriaSeleccionada]);

  const estaPresente = (jugador, asistencia) => {
    const nombreCompleto = `${jugador.NOMBRE} ${jugador.APELLIDO}`;
    return asistencia.presentes?.some(
      (p) => p.toUpperCase() === nombreCompleto.toUpperCase()
    );
  };

 const exportarPDF = () => {
    console.log("Generando PDF...");
    console.log("Asistencias:", asistencias.length);
    console.log("Jugadores:", jugadores.length);
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Planilla de Asistencias - ${categoriaSeleccionada.label}`, 14, 15);

    const columnas = [
      { header: "Jugador", dataKey: "jugador" },
      ...asistencias.map((a) => ({
        header: a.fecha.split("/").slice(0, 2).join("/"),
        dataKey: a.id,
      })),
    ];

    const filas = jugadores.map((jugador) => {
      const fila = { jugador: jugador.APELLIDO };
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
      headStyles: {
        fillColor: [30, 30, 30],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 9,
        halign: "center",
      },
      columnStyles: {
        jugador: {
          halign: "left",
          fontStyle: "bold",
          cellWidth: 40,
        },
      },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.dataKey !== "jugador") {
          if (data.cell.raw === "P") {
            data.cell.styles.textColor = [22, 163, 74];
            data.cell.styles.fontStyle = "bold";
          } else {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = "bold";
          }
        }
      },
    });

    const blob = pdf.output("blob");
const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = `Planilla_${categoriaSeleccionada.label}.pdf`;
link.click();
URL.revokeObjectURL(url);
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
                key={cat.valor}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("planilla"); }}
                style={{ width: "100%", padding: "18px 16px", background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "12px", color: "#fff", fontSize: "15px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}
              >
                {cat.label}
                <span style={{ color: "#555" }}>›</span>
              </button>
            ))}
          </div>
          <div>
            <p style={{ color: "#666", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Juveniles</p>
            {CATEGORIAS.slice(7).map((cat) => (
              <button
                key={cat.valor}
                onClick={() => { setCategoriaSeleccionada(cat); setPantalla("planilla"); }}
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

  return (
    <div style={{ background: "#111", minHeight: "100vh", paddingBottom: "100px" }}>
      <Navbar />
      <div style={{ padding: "24px 16px" }}>
        <button
          onClick={() => setPantalla("categorias")}
          style={{ background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "10px", color: "#fff", fontSize: "14px", padding: "8px 16px", marginBottom: "20px", cursor: "pointer" }}
        >
          ← Atrás
        </button>
        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px", color: "#fff", textTransform: "uppercase" }}>
          Planilla: {categoriaSeleccionada.label}
        </h1>

        {asistencias.length === 0 ? (
          <p style={{ color: "#666" }}>No hay asistencias registradas para esta categoría.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px" }}>
              <thead>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", color: "#888", fontSize: "13px", borderBottom: "1px solid #2e2e2e", borderRight: "1px solid #2e2e2e", position: "sticky", left: 0, background: "#111" }}>
                    Jugador
                  </th>
                  {asistencias.map((a) => (
                    <th key={a.id} style={{ padding: "12px 10px", textAlign: "center", color: "#888", fontSize: "13px", borderBottom: "1px solid #2e2e2e", borderRight: "1px solid #2e2e2e", whiteSpace: "nowrap" }}>
                      {a.fecha.split("/").slice(0, 2).join("/")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jugadores.map((jugador) => (
                  <tr key={jugador.id} style={{ borderBottom: "1px solid #1e1e1e" }}>
                    <td style={{ padding: "12px 16px", color: "#fff", fontSize: "14px", fontWeight: 600, textTransform: "uppercase", position: "sticky", left: 0, background: "#111", borderRight: "1px solid #2e2e2e" }}>
                      {jugador.APELLIDO}
                    </td>
                    {asistencias.map((a) => (
                      <td key={a.id} style={{ padding: "12px 10px", textAlign: "center", borderRight: "1px solid #2e2e2e" }}>
                        {estaPresente(jugador, a) ? (
                          <span style={{ color: "#16a34a", fontSize: "18px", fontWeight: 700 }}>✓</span>
                        ) : (
                          <span style={{ color: "#dc2626", fontSize: "18px", fontWeight: 700 }}>✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "16px", background: "#111", borderTop: "1px solid #2e2e2e" }}>
        <button
          onClick={exportarPDF}
          style={{ width: "100%", padding: "16px", background: "#2563eb", border: "none", borderRadius: "12px", color: "#fff", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
        >
          Exportar a PDF
        </button>
      </div>
    </div>
  );
}