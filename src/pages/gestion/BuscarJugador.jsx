import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, getDownloadURL, getStorage } from "firebase/storage"; // Volvemos a importar Storage
import { db } from "../../firebase"; 
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";

// --- FUNCIÓN AUXILIAR PARA CATEGORÍAS ---
function obtenerNombreCategoria(fechaNacimiento) {
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

export default function BuscarJugador() {
  const [jugadores, setJugadores] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSel, setCategoriaSel] = useState("Todas");
  const [listaCategorias, setListaCategorias] = useState(["Todas"]);
  const [fotosJugadores, setFotosJugadores] = useState({}); // Para guardar URLs
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  const storage = getStorage();

  const ESCUDO_URL = "/images/unionas_escudo.png"; 

  // 1. Cargar Jugadores y Categorías
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const q = query(collection(db, "JUGADORES"), orderBy("APELLIDO", "asc"));
        const snapshot = await getDocs(q);
        const listaJugadores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJugadores(listaJugadores);

        const categoriasSet = new Set(["Todas"]);
        listaJugadores.forEach(j => {
          if (j["FECHA NACIMIENTO"]) {
            categoriasSet.add(obtenerNombreCategoria(j["FECHA NACIMIENTO"]));
          }
        });
        const catsOrdenadas = Array.from(categoriasSet).sort((a, b) => {
            if (a === "Todas") return -1;
            if (b === "Todas") return 1;
            return a.localeCompare(b);
        });
        setListaCategorias(catsOrdenadas);
      } catch (error) { console.error(error); } 
      finally { setCargando(false); }
    };
    fetchDatos();
  }, []);

  // 2. Filtrado de la lista
  const filtrados = jugadores.filter(j => {
    const completo = `${j.NOMBRE} ${j.APELLIDO}`.toLowerCase();
    const coincideBusqueda = completo.includes(busqueda.toLowerCase());
    const catJugador = obtenerNombreCategoria(j["FECHA NACIMIENTO"]);
    const coincideCat = categoriaSel === "Todas" || catJugador === categoriaSel;
    return coincideBusqueda && coincideCat;
  });

  // 3. LÓGICA HÍBRIDA: Cargar fotos SOLO si hay una categoría seleccionada
  useEffect(() => {
    const cargarFotos = async () => {
      // Si está en "Todas", no gastamos recursos buscando fotos
      if (categoriaSel === "Todas") return;

      const nuevasFotos = { ...fotosJugadores };
      const extensiones = [".jpg", ".png", ".jpeg"];

      for (const j of filtrados) {
        if (!nuevasFotos[j.DNI]) {
          let urlEncontrada = null;
          for (const ext of extensiones) {
            try {
              urlEncontrada = await getDownloadURL(ref(storage, `fotos_jugadores/${j.DNI}${ext}`));
              break;
            } catch (e) { continue; }
          }
          nuevasFotos[j.DNI] = urlEncontrada || "NO_FOTO";
        }
      }
      setFotosJugadores(nuevasFotos);
    };

    cargarFotos();
  }, [categoriaSel, filtrados, storage]); // Se activa cuando cambias la categoría

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.btnAtras}>← ATRÁS</button>
        <h1 style={styles.tituloHeader}>BUSCAR JUGADOR</h1>

        <div style={styles.searchWrapper}>
          <input 
            placeholder="Nombre o Apellido..." 
            value={busqueda} 
            onChange={(e) => setBusqueda(e.target.value)}
            style={styles.inputSearch}
          />
          <select value={categoriaSel} onChange={(e) => setCategoriaSel(e.target.value)} style={styles.selectCat}>
            {listaCategorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={styles.lista}>
          {cargando ? (
            <p style={styles.msgEstado}>Cargando plantel...</p>
          ) : filtrados.length > 0 ? (
            filtrados.map(j => {
              // Decidimos qué imagen mostrar
              const fotoDelPibe = fotosJugadores[j.DNI];
              const mostrarFotoReal = categoriaSel !== "Todas" && fotoDelPibe && fotoDelPibe !== "NO_FOTO";

              return (
                <div key={j.id} style={styles.card} onClick={() => navigate(`/gestion/ficha/${j.DNI}`)}>
                  <div style={styles.avatarSeccion}>
                    <div style={styles.circuloFoto}>
                      <img 
                        src={mostrarFotoReal ? fotoDelPibe : ESCUDO_URL} 
                        style={mostrarFotoReal ? styles.fotoImgReal : styles.fotoImgEscudo} 
                        alt="Jugador"
                        onError={(e) => { e.target.src = ESCUDO_URL; }} 
                      />
                    </div>
                  </div>
                  <div style={styles.infoSeccion}>
                    <p style={styles.apellidoTxt}>{j.APELLIDO}</p>
                    <p style={styles.nombreTxt}>{j.NOMBRE}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={styles.msgEstado}>No se encontraron jugadores</p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#111", minHeight: "100vh", color: "white", fontFamily: 'Arial, sans-serif' },
  container: { padding: "20px 16px", maxWidth: "600px", margin: "0 auto" },
  btnAtras: { background: "#1e1e1e", border: "1px solid #333", color: "#fff", padding: "10px 18px", borderRadius: "12px", marginBottom: "20px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  tituloHeader: { fontSize: "20px", fontWeight: "800", textAlign: "center", marginBottom: "25px", color: '#fff' },
  searchWrapper: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px" },
  inputSearch: { background: "#1e1e1e", border: "1px solid #333", borderRadius: "10px", padding: "14px", color: "white", fontSize: "16px", outline: "none" },
  selectCat: { background: "#1e1e1e", border: "1px solid #333", borderRadius: "10px", padding: "12px", color: "white", fontSize: "14px", outline: "none", cursor: "pointer" },
  lista: { display: "flex", flexDirection: "column", gap: "10px" },
  card: { background: "#1e1e1e", border: "1px solid #2e2e2e", borderRadius: "16px", padding: "12px 16px", display: "flex", alignItems: "center", cursor: "pointer" },
  avatarSeccion: { width: "50px", height: "50px", marginRight: "15px" },
  circuloFoto: { width: "100%", height: "100%", borderRadius: "50%", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", overflow: 'hidden' },
  // Estilo para cuando es la foto del pibe (llena todo el círculo)
  fotoImgReal: { width: "100%", height: "100%", objectFit: "cover" },
  // Estilo para cuando es el escudo (un poco más chico con margen)
  fotoImgEscudo: { width: "100%", height: "100%", objectFit: "contain", padding: "4px" },
  infoSeccion: { flex: 1 },
  apellidoTxt: { margin: 0, fontWeight: "800", fontSize: "15px", textTransform: "uppercase", color: "#fff" },
  nombreTxt: { margin: "2px 0 0", color: "#aaa", fontSize: "13px" },
  msgEstado: { textAlign: 'center', color: '#666', marginTop: '20px' }
};