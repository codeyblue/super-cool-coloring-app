export const draw = ({ ctx, x, y, pressure, size, color }) => {
  console.log(color);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size * pressure, 0, 360);
  ctx.closePath();
  ctx.fill();
};
