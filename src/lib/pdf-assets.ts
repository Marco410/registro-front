/**
 * Utilidades para los PDF que se arman en el navegador con jsPDF: bajar fondos y fuentes
 * de `/public` y pasar fuentes a base64, que es como jsPDF las registra.
 */

/** ArrayBuffer → base64, en bloques para no pasar el límite de argumentos. */
export function aBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

/**
 * Baja un archivo (por ejemplo `/images/formato.jpeg`).
 * @param mensaje Error que se lanza si no se pudo bajar
 */
export async function bajarArchivo(url: string, mensaje: string): Promise<ArrayBuffer> {
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(mensaje);
  return respuesta.arrayBuffer();
}

/** Fondo y fuente de un PDF, listos para jsPDF. */
export interface PdfAssets {
  imagen: Uint8Array;
  fuenteBase64: string;
}

/**
 * Carga un fondo y una fuente una sola vez por sesión: la primera llamada los baja y las
 * siguientes reutilizan la misma promesa (si falla, se vuelve a intentar la próxima vez).
 */
export function cargadorPdfAssets(imagenUrl: string, fuenteUrl: string) {
  let promesa: Promise<PdfAssets> | null = null;
  return (): Promise<PdfAssets> => {
    promesa ??= Promise.all([
      bajarArchivo(imagenUrl, "No se pudo cargar la imagen de fondo"),
      bajarArchivo(fuenteUrl, "No se pudo cargar la fuente"),
    ])
      .then(([imagen, fuente]) => ({
        imagen: new Uint8Array(imagen),
        fuenteBase64: aBase64(fuente),
      }))
      .catch((err) => {
        promesa = null;
        throw err;
      });
    return promesa;
  };
}
