import sharp from "sharp";

export async function compressImage(
  buffer: Buffer,
  maxWidth = 1200,
  quality = 80
): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();
}

export async function convertToWebP(
  buffer: Buffer,
  quality = 80
): Promise<Buffer> {
  return sharp(buffer).webp({ quality }).toBuffer();
}

export async function generateThumbnail(
  buffer: Buffer,
  width = 200,
  height = 200
): Promise<Buffer> {
  return sharp(buffer)
    .resize({
      width,
      height,
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 70 })
    .toBuffer();
}
