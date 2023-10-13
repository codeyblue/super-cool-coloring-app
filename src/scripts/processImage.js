const applyFilters = (img, filters = '') => {
  const canvas = Object.assign(document.createElement('canvas'), { width: img.naturalWidth, height: img.naturalHeight });
  const ctx = canvas.getContext('2d');
  ctx.filter = filters;
  ctx.drawImage(img, 0, 0);
  return canvas;
}

const getOutline = (img, width, height) => {
  const settings = {
    grayscale: 100,
    contrast: 200,
    brightness: 200,
    invert: 50,
    blur: 5
  }; // these will be changable by the user at a later date perhaps

  const bw = applyFilters(img, `grayscale(${settings.grayscale}%) contrast(${settings.contrast}%) brightness(${settings.brightness}%)`);
  const blur = applyFilters(img, `grayscale(${settings.grayscale}%) contrast(${settings.contrast}%) brightness(${settings.brightness}%) invert(${settings.invert}%) blur(${settings.blur}px)`);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(bw, 0, 0, width, height);
  ctx.globalCompositeOperation = 'color-dodge';
  ctx.drawImage(blur, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
};

export const ProcessImage = {
  getOutline
};
