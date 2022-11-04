import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";
import "../style.css";

const video$ = document.querySelector("video");
const cursor$ = document.querySelector(".cursor");

const width = window.innerWidth;
const height = window.innerHeight;

const handParts = {
  wrist: 0,
  thumb: { base: 1, middle: 2, topKnuckle: 3, tip: 4 },
  indexFinger: { base: 5, middle: 6, topKnuckle: 7, tip: 8 },
  middleFinger: { base: 9, middle: 10, topKnuckle: 11, tip: 12 },
  ringFinger: { base: 13, middle: 14, topKnuckle: 15, tip: 16 },
  pinky: { base: 17, middle: 18, topKnuckle: 19, tip: 20 },
};

const hands = new Hands({
  locateFile: (file) => `../node_modules/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 0,
});
hands.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await hands.send({ image: video$ });
  },
  facingMode: undefined,
  width,
  height,
});
camera.start();

const getCursorCoords = (landmarks) =>
  landmarks[handParts.indexFinger.topKnuckle];

const convertCoordsToDomPosition = ({ x, y }) => ({
  x: `${x * 100}vw`,
  y: `${y * 100}vh`,
});

function updateCursorPosition(landmarks) {
  const cursorCoords = getCursorCoords(landmarks);
  if (!cursorCoords) return;

  const { x, y } = convertCoordsToDomPosition(cursorCoords);

  cursor$.style.transform = `translate(${x}, ${y})`;
}

function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updateCursorPosition(handData.multiHandLandmarks[0]);
}
