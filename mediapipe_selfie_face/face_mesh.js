import "./style.css";
import { Camera } from "@mediapipe/camera_utils";
// import { drawConnectors } from "@mediapipe/drawing_utils";
import {
  FaceMesh,
  // FACEMESH_FACE_OVAL,
  // FACEMESH_LEFT_EYE,
  // FACEMESH_LEFT_EYEBROW,
  // FACEMESH_LEFT_IRIS,
  // FACEMESH_LIPS,
  // FACEMESH_RIGHT_EYE,
  // FACEMESH_RIGHT_EYEBROW,
  // FACEMESH_RIGHT_IRIS,
  // FACEMESH_TESSELATION,
} from "@mediapipe/face_mesh";

const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");
const WIDTH = (canvas$.width = window.innerWidth);
const HEIGHT = (canvas$.height = window.innerHeight);
const noseImage$ = document.querySelector(".nose-image");
const starImage$ = document.querySelector(".star-image");

const NOSE_SIZE = 50;

function drawNose(landmarks) {
  const x = landmarks[4].x * WIDTH - NOSE_SIZE / 2;
  const y = landmarks[4].y * HEIGHT - NOSE_SIZE / 2;
  ctx.drawImage(noseImage$, x, y, NOSE_SIZE, NOSE_SIZE);
}

function drawStars(landmarks) {
  const rightEyeLeft = landmarks[33].x;
  const rightEyeRight = landmarks[133].x;

  const rightStarWidth = (rightEyeRight - rightEyeLeft) * WIDTH * 1.5;

  const rightStarX = landmarks[159].x * WIDTH - rightStarWidth / 2;

  const rightEyeTop = landmarks[159].y;
  const rightEyeBottom = landmarks[145].y;

  const rightStarY =
    (rightEyeTop + (rightEyeBottom - rightEyeTop)) * HEIGHT -
    rightStarWidth / 2;

  ctx.drawImage(
    starImage$,
    rightStarX,
    rightStarY,
    rightStarWidth,
    rightStarWidth
  );

  const leftEyeLeft = landmarks[362].x;
  const leftEyeRight = landmarks[263].x;

  const leftStarWidth = (leftEyeRight - leftEyeLeft) * WIDTH * 1.5;

  const leftStarX = landmarks[386].x * WIDTH - leftStarWidth / 2;

  const leftEyeTop = landmarks[386].y;
  const leftEyeBottom = landmarks[374].y;

  const leftStarY =
    (leftEyeTop + (leftEyeBottom - leftEyeTop)) * HEIGHT - leftStarWidth / 2;

  ctx.drawImage(starImage$, leftStarX, leftStarY, leftStarWidth, leftStarWidth);
}

function onResults(results) {
  console.log(results);
  ctx.save();
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);
  if (results.multiFaceLandmarks.length) {
    drawStars(results.multiFaceLandmarks[0]);

    drawNose(results.multiFaceLandmarks[0]);

    // for (const landmarks of results.multiFaceLandmarks) {
    //   drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
    //     color: "#C0C0C070",
    //     lineWidth: 1,
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYE, {
    //     color: "#FF3030",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_RIGHT_EYEBROW, {
    //     color: "#FF3030",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_RIGHT_IRIS, {
    //     color: "#FF3030",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYE, {
    //     color: "#30FF30",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_LEFT_EYEBROW, {
    //     color: "#30FF30",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_LEFT_IRIS, {
    //     color: "#30FF30",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_FACE_OVAL, {
    //     color: "#E0E0E0",
    //   });
    //   drawConnectors(ctx, landmarks, FACEMESH_LIPS, { color: "#E0E0E0" });
    // }
  }
  ctx.restore();
}

const faceMesh = new FaceMesh({
  locateFile: (file) => `../node_modules/@mediapipe/face_mesh/${file}`,
});
faceMesh.setOptions({
  maxNumFaces: 1,
  refineLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
});
faceMesh.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await faceMesh.send({ image: video$ });
  },
  facingMode: undefined,
  width: WIDTH,
  height: HEIGHT,
});
camera.start();
