import * as Tone from "https://cdn.skypack.dev/tone";

let currentPlayers = [];
let globalVolume = new Tone.Volume(-6).toDestination();

const TRACKS = ["bass", "chords", "drums", "fx", "pads"];
const STYLES = ["lofi", "acoustic", "ambient", "hiphop", "r&b"];
let currentStyle = "lofi";
let bpm = 70;

function getRandomSample(style, track) {
  const variant = Math.floor(Math.random() * 8) + 1;
  return `assets/${style}/${track}/${capitalize(track)} - ${variant}.wav`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

async function loadAndPlay(style) {
  currentPlayers.forEach((p) => p.stop());
  currentPlayers = [];

  Tone.Transport.bpm.value = bpm;

  for (const track of TRACKS) {
    const url = getRandomSample(style, track);
    const player = new Tone.Player({
      url,
      loop: true,
      autostart: true,
    }).connect(globalVolume);

    currentPlayers.push(player);
  }

  await Tone.start();
  Tone.Transport.start();
}

// --- Ici on prend le canvas "graph" ---
const graphCanvas = document.getElementById("graph");
const graphCtx = graphCanvas.getContext("2d");

function resizeGraph() {
  graphCanvas.width = window.innerWidth;
  graphCanvas.height = 200;
}
resizeGraph();
window.addEventListener("resize", resizeGraph);

const analyser = new Tone.Analyser("waveform", 2048);
globalVolume.connect(analyser);

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);
  const values = analyser.getValue();

  graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
  graphCtx.lineWidth = 7;
  graphCtx.strokeStyle = "rgba(114, 214, 114, 0.8)";
  graphCtx.beginPath();

  const sliceWidth = graphCanvas.width / values.length;
  let x = 0;

  for (let i = 0; i < values.length; i++) {
    const v = (values[i] + 1) / 2;
    const y = v * graphCanvas.height;

    i === 0 ? graphCtx.moveTo(x, y) : graphCtx.lineTo(x, y);
    x += sliceWidth;
  }

  graphCtx.stroke();
}

drawOscilloscope();

window.handlePlay = async function () {
  await Tone.start();
  loadAndPlay(currentStyle);
};

handlePlay();
