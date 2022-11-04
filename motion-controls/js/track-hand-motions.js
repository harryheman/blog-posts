import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";

const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");

const width = 320;
const height = 480;
canvas$.width = width;
canvas$.height = height;

function onResults(results) {
  if (!results.multiHandLandmarks.length) return;

  console.log("@landmarks", results.multiHandLandmarks[0]);

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(results.image, 0, 0, width, height);

  for (const landmarks of results.multiHandLandmarks) {
    drawLandmarks(ctx, landmarks, { color: "#FF0000", lineWidth: 2 });
    drawConnectors(ctx, landmarks, HAND_CONNECTIONS, {
      color: "#00FF00",
      lineWidth: 4,
    });
  }

  ctx.restore();
}

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
