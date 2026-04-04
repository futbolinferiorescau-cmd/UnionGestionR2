import React, { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import Navbar from "../../../components/Navbar";
import BottomNav from "../../../components/BottomNav";

export default function ConfigPrecios() {
  const [productos, setProductos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "productos_buffet"), (snap) => {
      setProductos(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const guardarProducto = async () => {
    if (!nombre || !precio) return alert("Completá nombre y precio");
    await addDoc(collection(db, "productos_buffet"), { 
      nombre: nombre.toUpperCase(), 
      precio: Number(precio) 
    });
    setNombre(""); setPrecio("");
  };

  return (
    <div style={pageStyle}>
      <Navbar />
      <div style={content}>
        <h2 style={titulo}>LISTA DE PRECIOS 🏷️</h2>
        
        <div style={form}>
          <input placeholder="PRODUCTO (Ej: CHORIPAN)" value={nombre} onChange={e => setNombre(e.target.value)} style={input} />
          <input placeholder="PRECIO $" type="number" value={precio} onChange={e => setPrecio(e.target.value)} style={input} />
          <button onClick={guardarProducto} style={btnCeleste}>AGREGAR</button>
        </div>

        <div style={lista}>
          {productos.length === 0 ? <p style={vacio}>No hay productos cargados</p> : 
            productos.map(p => (
              <div key={p.id} style={item}>
                <span style={nombreTxt}>{p.nombre}</span>
                <span style={precioTxt}>${p.precio}</span>
                <button onClick={() => deleteDoc(doc(db, "productos_buffet", p.id))} style={btnBorrar}>✕</button>
              </div>
            ))
          }
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

const pageStyle = { background: "#000", minHeight: "100vh", color: "#fff", paddingBottom: "100px" };
const content = { padding: "20px", maxWidth: "500px", margin: "0 auto" };
const titulo = { color: "#33b5e5", fontSize: "18px", textAlign: "center", fontWeight: "900", marginBottom: "20px" };
const form = { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px", background: "#111", padding: "15px", borderRadius: "12px" };
const input = { background: "#1a1a1a", border: "1px solid #333", padding: "12px", color: "#fff", borderRadius: "8px", outline: "none" };
const btnCeleste = { background: "#33b5e5", color: "#fff", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "900", cursor: "pointer" };
const lista = { background: "#111", borderRadius: "12px", overflow: "hidden" };
const item = { display: "flex", justifyContent: "space-between", padding: "15px", borderBottom: "1px solid #222", alignItems: "center" };
const nombreTxt = { fontSize: "14px", fontWeight: "bold", flex: 2 };
const precioTxt = { color: "#33b5e5", fontWeight: "900", flex: 1, textAlign: "right", marginRight: "15px" };
const btnBorrar = { background: "none", color: "#ff4444", border: "none", fontSize: "16px", cursor: "pointer" };
const vacio = { textAlign: "center", padding: "20px", color: "#444", fontSize: "13px" };