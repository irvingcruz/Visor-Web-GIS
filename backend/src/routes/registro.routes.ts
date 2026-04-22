import { Router } from "express";
import { RegistroController } from "../controllers/registro.controller";
import { uploader } from "../middleware/uploadServer";

export const registroRouter = Router();

registroRouter.post("/registrar", uploader.array("files", 3), (req, res) =>
    RegistroController.create(req, res)
);

registroRouter.get("/listGallery/:ambienteID", (req, res) =>
    RegistroController.listGallery(req, res)
);

registroRouter.get("/listGalleryPoint/:sedeID", (req, res) =>
    RegistroController.listGalleryPoint(req, res)
);

registroRouter.get("/data", (req, res) => {
    res.send("✅ Servidor GIS corriendo correctamente");
});

registroRouter.get("/delete-all", (req, res) =>
    RegistroController.deleteAll(req, res)
);
