import express from "express";
import cors from "cors";
import { errorHandler } from "./common/error.middleware";
import { registroRouter } from "./routes/registro.routes";
import ffmpeg from "fluent-ffmpeg";
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();

app.use(cors());
//app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Habilitar acceso público a uploads
app.use("/uploads", express.static("uploads"));

// RUTAS
app.use("/api/gis", /*authMiddleware,*/ registroRouter);

// MIDDLEWARE DE ERRORES
app.use(errorHandler);

export default app;
