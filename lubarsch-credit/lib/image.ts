/** Shrinks a photo in the browser before upload (saves the customer's data). Returns a JPEG data URL. */
export async function compressImage(file: File, maxSide = 1280, quality = 0.7): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    let out = canvas.toDataURL("image/jpeg", quality);
    // keep shrinking if still large (target < ~600KB)
    while (out.length > 800_000 && quality > 0.35) {
      quality -= 0.1;
      out = canvas.toDataURL("image/jpeg", quality);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
