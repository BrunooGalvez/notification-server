const express = require("express");
const app = express();
app.use(express.json());

// Inicializar Firebase Admin
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Endpoint para actualizar ubicación del conductor
app.post("/update-location", async (req, res) => {
  const { uid, lat, lng, precision, servicioId, pasajero, tipoServicio, conductor, aerolinea } = req.body;

  if (!uid || !lat || !lng) {
    return res.status(400).json({ error: "Faltan datos de ubicación" });
  }

  try {
    await db.collection("conductores_ubicacion").doc(uid).set({
      lat,
      lng,
      precision: precision || 0,
      conductorId: uid,
      servicioId: servicioId || "",
      pasajero: pasajero || "",
      tipoServicio: tipoServicio || "",
      conductor: conductor || "",
      aerolinea: aerolinea || "",
      activo: true,
      ultimaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.json({ success: true });
  } catch (e) {
    console.error("Error actualizando ubicación:", e);
    res.status(500).json({ error: e.message });
  }
});

// Endpoint para enviar notificación push
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;
  if (!token) return res.status(400).json({ error: "Token requerido" });

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        to: token,
        sound: "default",
        title: title || "BYJA Transportes",
        body: body || "Tienes un nuevo servicio",
        data: data || {},
        channelId: "servicios",
        priority: "high",
      }),
    });
    const result = await response.json();
    res.json({ success: true, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.json({ 
  status: "BYJA Server running",
  time: new Date().toISOString()
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));