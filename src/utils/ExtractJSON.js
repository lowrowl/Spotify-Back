// src/utils/extractJSON.js
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const extractJSON = ({ path }) => {
  try {
    // Importa el JSON. Asegúrate de que la ruta sea correcta desde el punto de vista del archivo que lo llama.
    return require(path);
  } catch (error) {
    console.log(`Hubo un error al importar json desde ${path}. Error: ${error.message}`);
    return false;
  }
};

export default extractJSON;