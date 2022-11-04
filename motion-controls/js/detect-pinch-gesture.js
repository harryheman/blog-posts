import { Camera } from "@mediapipe/camera_utils";
import { Hands } from "@mediapipe/hands";

const video$ = document.querySelector("video");

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

const getFingerCoords = (landmarks) =>
  landmarks[handParts.indexFinger.topKnuckle];

function onResults(handData) {
  if (!handData.multiHandLandmarks.length) return;

  updatePinchState(handData.multiHandLandmarks[0]);
}

const PINCH_EVENTS = {
  START: "pinch_start",
  MOVE: "pinch_move",
  STOP: "pinch_stop",
};

const OPTIONS = {
  PINCH_DELAY_MS: 250,
};

const state = {
  isPinched: false,
  pinchChangeTimeout: null,
};

function isPinched(landmarks) {
  const fingerTip = landmarks[handParts.indexFinger.tip];
  const thumbTip = landmarks[handParts.thumb.tip];
  if (!fingerTip || !thumbTip) return;

  const distance = {
    x: Math.abs(fingerTip.x - thumbTip.x),
    y: Math.abs(fingerTip.y - thumbTip.y),
    z: Math.abs(fingerTip.z - thumbTip.z),
  };

  const areFingersCloseEnough =
    distance.x < 0.08 && distance.y < 0.08 && distance.z < 0.11;

  return areFingersCloseEnough;
}

function triggerEvent({ eventName, eventData }) {
  const event = new CustomEvent(eventName, { detail: eventData });
  document.dispatchEvent(event);
}

function updatePinchState(landmarks) {
  const wasPinchedBefore = state.isPinched;
  const isPinchedNow = isPinched(landmarks);
  const hasPassedPinchThreshold = isPinchedNow !== wasPinchedBefore;
  const hasWaitStarted = !!state.pinchChangeTimeout;

  if (hasPassedPinchThreshold && !hasWaitStarted) {
    registerChangeAfterWait(landmarks, isPinchedNow);
  }

  if (!hasPassedPinchThreshold) {
    cancelWaitForChange();

    if (isPinchedNow) {
      triggerEvent({
        eventName: PINCH_EVENTS.MOVE,
        eventData: getFingerCoords(landmarks),
      });
    }
  }
}

function registerChangeAfterWait(landmarks, isPinchedNow) {
  state.pinchChangeTimeout = setTimeout(() => {
    state.isPinched = isPinchedNow;

    triggerEvent({
      eventName: isPinchedNow ? PINCH_EVENTS.START : PINCH_EVENTS.STOP,
      eventData: getFingerCoords(landmarks),
    });
  }, OPTIONS.PINCH_DELAY_MS);
}

function cancelWaitForChange() {
  clearTimeout(state.pinchChangeTimeout);
  state.pinchChangeTimeout = null;
}

function onPinchStart(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch started", fingerCoords);
}

function onPinchMove(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch moved", fingerCoords);
}

function onPinchStop(eventInfo) {
  const fingerCoords = eventInfo.detail;
  console.log("Pinch stopped", fingerCoords);
}

document.addEventListener(PINCH_EVENTS.START, onPinchStart);
document.addEventListener(PINCH_EVENTS.MOVE, onPinchMove);
document.addEventListener(PINCH_EVENTS.STOP, onPinchStop);
