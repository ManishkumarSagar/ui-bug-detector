const sharp = require('sharp');

async function highlightDifferences(diffPath, outPath) {
  const { data, info } = await sharp(diffPath)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 3);

  for (let i = 0, j = 0; i < data.length; i += channels, j += 3) {
    const isDiff = data[i] > 30 || data[i + 1] > 30 || data[i + 2] > 30;
    out[j] = isDiff ? 255 : 245;
    out[j + 1] = isDiff ? 0 : 245;
    out[j + 2] = isDiff ? 0 : 245;
  }

  await sharp(out, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(outPath);

  return outPath;
}

module.exports = { highlightDifferences };