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

const oscCanvas = document.getElementById("oscilloscope");
const oscCtx = oscCanvas.getContext("2d");

function resizeOscilloscope() {
  oscCanvas.width = window.innerWidth;
  oscCanvas.height = 100;
}
resizeOscilloscope();
window.addEventListener("resize", resizeOscilloscope);

const analyser = new Tone.Analyser("waveform", 2048);
globalVolume.connect(analyser);

function drawOscilloscope() {
  requestAnimationFrame(drawOscilloscope);
  const values = analyser.getValue();

  oscCtx.clearRect(0, 0, oscCanvas.width, oscCanvas.height);
  oscCtx.lineWidth = 2;
  oscCtx.strokeStyle = "rgba(114, 214, 114, 0.8)";
  oscCtx.beginPath();

  const sliceWidth = oscCanvas.width / values.length;
  let x = 0;

  for (let i = 0; i < values.length; i++) {
    const v = (values[i] + 1) / 2;
    const y = v * oscCanvas.height;

    i === 0 ? oscCtx.moveTo(x, y) : oscCtx.lineTo(x, y);
    x += sliceWidth;
  }

  oscCtx.stroke();
}

drawOscilloscope();

window.handlePlay = async function () {
  await Tone.start();
  loadAndPlay(currentStyle);
};

window.handleStop = function () {
  currentPlayers.forEach((p) => {
    try {
      p.stop();
      p.dispose();
    } catch (e) {
      console.warn("Erreur à l'arrêt du player :", e);
    }
  });

  currentPlayers = [];

  Tone.Transport.stop();
  Tone.Transport.position = "0:0:0";
};

document.getElementById("style").addEventListener("change", (e) => {
  currentStyle = e.target.value;
});

document.getElementById("volume").addEventListener("input", (e) => {
  const vol = parseFloat(e.target.value);
  globalVolume.volume.value = Tone.gainToDb(vol);
});

document.getElementById("bpm").addEventListener("input", (e) => {
  bpm = parseInt(e.target.value);
  Tone.Transport.bpm.value = bpm;
});
