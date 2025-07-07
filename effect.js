const canvas = document.getElementById("effectCanvas");
const ctx = canvas.getContext("2d");

const colorPalette = [
  { center: "rgba(114, 214, 114, 0.3)", edge: "rgba(114, 214, 114, 0)" }, // vert tendre
  { center: "rgba(100, 200, 200, 0.3)", edge: "rgba(100, 200, 200, 0)" }, // turquoise pastel
  { center: "rgba(90, 150, 230, 0.3)", edge: "rgba(90, 150, 230, 0)" }, // bleu doux
  { center: "rgba(140, 130, 220, 0.3)", edge: "rgba(140, 130, 220, 0)" }, // violet brumeux
  { center: "rgba(120, 180, 140, 0.3)", edge: "rgba(120, 180, 140, 0)" }, // vert-gris doux
  { center: "rgba(110, 190, 160, 0.3)", edge: "rgba(110, 190, 160, 0)" }, // vert d'eau
];

let width, height;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(devicePixelRatio, devicePixelRatio);
}
resize();
window.addEventListener("resize", resize);

const bpm = 70;
const interval = 60000 / bpm;

class PulseBlob {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseRadius = 40 + Math.random() * 40;
    this.phase = Math.random() * 2 * Math.PI;
    this.colorIndexOffset = Math.floor(Math.random() * colorPalette.length);

    this.rotationPhase = Math.random() * 2 * Math.PI;
    this.rotationAmplitude = 0.1;
    this.translationAmplitude = 15;
    this.translationPhaseX = Math.random() * 2 * Math.PI;
    this.translationPhaseY = Math.random() * 2 * Math.PI;
  }

  draw(t) {
    let pulse = 0.7 + 0.3 * Math.sin((t / interval) * 2 * Math.PI + this.phase);
    let radius = this.baseRadius * pulse;

    let rotation =
      this.rotationAmplitude *
      Math.sin((t / interval) * 2 * Math.PI + this.rotationPhase);

    let translateX =
      this.translationAmplitude *
      Math.sin((t / interval) * 2 * Math.PI + this.translationPhaseX);
    let translateY =
      this.translationAmplitude *
      Math.sin((t / interval) * 2 * Math.PI + this.translationPhaseY);

    ctx.save();
    ctx.translate(this.x + translateX, this.y + translateY);
    ctx.rotate(rotation);

    // Index basé sur le temps et le décalage unique du blob
    let colorIndex =
      Math.floor(t / interval + this.colorIndexOffset) % colorPalette.length;
    let { center: colorCenter, edge: colorEdge } = colorPalette[colorIndex];

    // Dégradé radial avec couleurs de la palette
    let gradient = ctx.createRadialGradient(0, 0, radius * 0.4, 0, 0, radius);
    gradient.addColorStop(0, colorCenter);
    gradient.addColorStop(1, colorEdge);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * 1.2, radius, 0, 0, 2 * Math.PI);
    ctx.fill();

    ctx.restore();
  }
}

const blobs = [];
const numBlobs = 10;
for (let i = 0; i < numBlobs; i++) {
  blobs.push(new PulseBlob());
}

function animate(time = 0) {
  ctx.clearRect(0, 0, width, height);
  blobs.forEach((blob) => blob.draw(time));
  requestAnimationFrame(animate);
}
animate();
