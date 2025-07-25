import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const extractJSON = ({ path: relativePath }) => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Construye la ruta desde src/config/
    const absolutePath = path.resolve(__dirname, '../config', relativePath);

    const rawData = fs.readFileSync(absolutePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error(`❌ Hubo un error al importar json desde ${relativePath}. Error: ${error.message}`);
    return false;
  }
};

export default extractJSON;
