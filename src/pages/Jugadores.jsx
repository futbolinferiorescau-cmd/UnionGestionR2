import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function getCategoria(fechaNacimiento) {
  const año = parseInt(fechaNacimiento.split("/")[2]);
  if (año >= 2020) return "Escuelita";
  if (año === 2019) return "Infantiles - 2019";
  if (año === 2018) return "Infantiles - 2018";
  if (año === 2017) return "Infantiles - 2017";
  if (año === 2016) return "Infantiles - 2016";
  if (año === 2015) return "Infantiles - 2015";
  if (año === 2014) return "Infantiles - 2014";
  if (año === 2013) return "Juveniles - Séptima";
  if (año === 2012) return "Juveniles - Sexta";
  if (año === 2011 || año === 2010) return "Juveniles - Quinta";
  if (año === 2009 || año === 2008) return "Juveniles - Cuarta";
  return "Sin categoría";
}

export default function Jugadores() {
  const [jugadores, setJugadores] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");

  useEffect(() => {
    const fetchJugadores = async () => {
      const querySnapshot = await getDocs(collection(db, "JUGADORES"));
      const lista = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        categoria: getCategoria(doc.data()["FECHA NACIMIENTO"]),
      }));
      setJugadores(lista);
    };
    fetchJugadores();
  }, []);

  const categorias = ["Todas", ...new Set(jugadores.map((j) => j.categoria))];

  const jugadoresFiltrados =
    categoriaSeleccionada === "Todas"
      ? jugadores
      : jugadores.filter((j) => j.categoria === categoriaSeleccionada);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Jugadores</h1>

      <select
        value={categoriaSeleccionada}
        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", fontSize: "16px" }}
      >
        {categorias.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Nombre</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Apellido</th>
            <th style={{ padding: "10px", textAlign: "left" }}>DNI</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Categoría</th>
          </tr>
        </thead>
        <tbody>
          {jugadoresFiltrados.map((jugador) => (
            <tr key={jugador.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{jugador.NOMBRE}</td>
              <td style={{ padding: "10px" }}>{jugador.APELLIDO}</td>
              <td style={{ padding: "10px" }}>{jugador.DNI}</td>
              <td style={{ padding: "10px" }}>{jugador.categoria}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}