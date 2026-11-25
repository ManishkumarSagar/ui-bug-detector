const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

function compareImages(refPath, actPath, diffPath, threshold = 0.1) {
  const ref = PNG.sync.read(fs.readFileSync(refPath));
  const act = PNG.sync.read(fs.readFileSync(actPath));

  if (ref.width !== act.width || ref.height !== act.height) {
    throw new Error('Screenshot dimensions do not match');
  }

  const { width, height } = ref;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    ref.data,
    act.data,
    diff.data,
    width,
    height,
    { threshold }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  return {
    diffPixels,
    totalPixels: width * height,
    diffPercent: (diffPixels / (width * height)) * 100
  };
}

module.exports = { compareImages };