import multer from 'multer';
import path from 'path';
import fs from 'fs';

// import { fileURLToPath } from 'url';

// Carpeta destino
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const uploadPathBaseSedes = path.join(__dirname, '../../uploads/sedes');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const source = 1; //1.Sedes

        const projectFolder = path.join(uploadPathBaseSedes);

        // Crear carpeta si no existe
        if (!fs.existsSync(projectFolder)) {
            fs.mkdirSync(projectFolder, { recursive: true });
        }

        cb(null, projectFolder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const now = new Date();
        const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
        const hhmmss = now
            .toTimeString()
            .slice(0, 8)
            .replace(/:/g, "");
        const unique = `${yyyymmdd}-${hhmmss}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${ext}`);
    },
});

export const uploader = multer({
    storage,
    // limits: {
    //     fileSize: 3 * 1024 * 1024 // 3 MB
    // }
});

