// import express from "express";
// import cors from "cors";
// import dotenv from 'dotenv';

import app from "./app";

// dotenv.config();
// const app = express();
const PORT = process.env.PORT || 4000;

// app.use(cors());
// app.use(express.json());

// app.use("/api/proyectos", componentesRoutes);
// app.use("/api/gis", gisRoutes);


// app.get("/", (req, res) => {
//   res.send("🌍 API GIS funcionando correctamente");
// });

app.listen(PORT, () => {
  console.log(`✅ Servidor backend PNSU corriendo en http://localhost:${PORT}`);
});

