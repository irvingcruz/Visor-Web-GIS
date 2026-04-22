import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const RegistroService = {

  async create(data: any, files?: Express.Multer.File[]) {
    try {
      const ambienteID = data.id;
      const codSede = data.codSede;
      const codigoPunto = data.codigoPunto;

      // console.log("files", files);
      if (files && files.length > 0) {
        for (const file of files) {
          await prisma.sencicoFotos.create({
            data: {
              sedeCod: codSede,
              fileUrl: file.filename,
              fileType: file.mimetype,
              fileName: file.originalname,
              fileSize: file.size,
              codePoint: codigoPunto,
              latitud: +(parseFloat(data.latitud).toFixed(6)),
              longitud: +(parseFloat(data.longitud).toFixed(6)),
              ambienteID: +ambienteID
            }
          });
        }
      }
      return {
        ambienteID,
        files: files
      };
    }
    catch (err) {
      console.log("Error al crear avance:", err);
      throw err;
    }
  },

  async listGallery(ambienteID: number) {
    const r = await prisma.sencicoFotos.findMany({
      where: {
        ambienteID: ambienteID
      }
    });
    return r.map((item: any) => ({
      name: item.fileUrl,
      type: item.fileType,
      size: (item.fileSize / 1024 / 1024).toFixed(2) + " MB",
      id: item.ambienteID
    }));
  },

  async listGalleryPoint(sedeID: number) {
    const r = await prisma.sencicoFotos.findMany({
      where: {
        sedeCod: sedeID.toString().padStart(2, '0')
      }
    });
    return r.map((item: any) => ({
      name: item.fileUrl,
      type: item.fileType,
      size: (item.fileSize / 1024 / 1024).toFixed(2) + " MB",
      id: item.ambienteID,
      lat: item.latitud,
      lng: item.longitud
    }));
  },

  async deleteAll() {
    const r = await prisma.sencicoFotos.deleteMany();
    return r;
  },

}


