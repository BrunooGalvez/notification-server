const express = require("express");
const app = express();
app.use(express.json());

// Inicializar Firebase Admin con la cuenta de servicio
let firebaseAdmin = null;

function getFirebaseAdmin() {
  if (firebaseAdmin) return firebaseAdmin;
  
  try {
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
    
    firebaseAdmin = admin;
    return admin;
  } catch (e) {
    console.error("Error inicializando Firebase Admin:", e.message);
    return null;
  }
}

// Endpoint para enviar notificación push via FCM V1
app.post("/send-notification", async (req, res) => {
  const { token, title, body, data } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token requerido" });
  }

  try {
    // Primero intentar con Expo Push API (más simple)
    const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
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

    const result = await expoResponse.json();
    console.log("Notificación enviada:", JSON.stringify(result));
    res.json({ success: true, result });
  } catch (e) {
    console.error("Error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (req, res) => res.json({ 
  status: "BYJA Notification Server running",
  time: new Date().toISOString()
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));