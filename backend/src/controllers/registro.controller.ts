import { Request, Response } from "express";
import { ApiResponse } from "../common/ApiResponse";
import path from "path";
import sharp from "sharp";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { RegistroService } from "../services/registro.service";

export const RegistroController = {

  async create(req: Request, res: Response) {
    try {
      const uploadedFiles = req.files as Express.Multer.File[] | undefined;

      await this.procesarFiles(uploadedFiles);

      // const fileList = uploadedFiles?.map(f => ({
      //   filename: f.filename,
      //   path: f.path,
      //   size: f.size,
      //   mime: f.mimetype
      // }));
      // console.log("req.body-create", req.body);
      const data = await RegistroService.create(req.body, uploadedFiles);
      // console.log("data-create", data);
      return res.status(200).json(ApiResponse.success([], "Avance creado correctamente."));
      // return res.status(400).json(ApiResponse.error("Testing", 400));
    } catch (err: any) {
      // console.error("registerProgress error:", err);
      // return res.status(500).json(ApiResponse.error("Error registrando progress", 500));
      if (err.message.startsWith("400=")) {
        res.status(200).json(ApiResponse.error(err.message.substring(4), 400));
      } else {
        res.status(500).json(ApiResponse.error(err.message, 500));
      }
    }
  },

  async listGallery(req: Request, res: Response) {
    try {
      const ambienteID = Number(req.params.ambienteID);
      const data = await RegistroService.listGallery(ambienteID);
      // console.log("data", data);
      res.json(ApiResponse.success(data));
    } catch (e: any) {
      res.status(500).json(ApiResponse.error(e.message, 500));
    }
  },

  async listGalleryPoint(req: Request, res: Response) {
    try {
      const sedeID = Number(req.params.sedeID);
      const data = await RegistroService.listGalleryPoint(sedeID);
      // console.log("data", data);
      res.json(ApiResponse.success(data));
    } catch (e: any) {
      res.status(500).json(ApiResponse.error(e.message, 500));
    }
  },

  async procesarFiles(uploadedFiles: Express.Multer.File[]) {
    // const processedFiles = [];
    for (const file of uploadedFiles) {

      const ext = path.extname(file.filename).toLowerCase();
      const inputPath = file.path;

      // Procesar solo imágenes
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const outputPath = file.path + "_tmp"; // temp output
        // Procesar imagen con escalado SIEMPRE
        await sharp(inputPath)
          .resize(1600, 1200, { //800x600
            fit: "cover",   // llena el 1600, 1200 manteniendo proporción
            withoutEnlargement: false // escala incluso si es menor
          })
          .toFile(outputPath);

        // Reemplazar archivo original por el procesado
        // fs.unlinkSync(inputPath);        // borrar original
        fs.renameSync(outputPath, inputPath); // mover el temp al original
      } else if ([".mp4", ".mov", ".avi", ".mkv"].includes(ext)) {
        const tempOutput = inputPath + "_tmp.mp4";

        await new Promise<void>((resolve, reject) => {

          ffmpeg(inputPath)
            .outputOptions([
              "-vf scale=800:600:force_original_aspect_ratio=decrease,pad=800:600:(ow-iw)/2:(oh-ih)/2",
              "-c:v libx264",   // compresión moderna
              "-crf 23",        // calidad (18 = alta, 28 = baja)
              "-preset fast",
              "-c:a copy"       // mantiene audio original
            ])
            .save(tempOutput)
            .on("end", () => {
              // Reemplazar el original
              // fs.unlinkSync(inputPath);
              fs.renameSync(tempOutput, inputPath);
              resolve();
            })
            .on("error", (err) => {
              console.error("Error procesando video:", err);
              reject(err);
            });

        });
      }

      // processedFiles.push(
      //   `/uploads${file.path.split("uploads")[1].replace(/\\/g, "/")}`
      // );
    }
  },

  async deleteAll(req: Request, res: Response) {
    try {
      const data = await RegistroService.deleteAll();
      // console.log("data", data);
      res.json(ApiResponse.success(data));
    } catch (e: any) {
      res.status(500).json(ApiResponse.error(e.message, 500));
    }
  },

}