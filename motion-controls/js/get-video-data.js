const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");

const width = 320;
const height = 480;

canvas$.width = width;
canvas$.height = height;

const constraints = {
  audio: false,
  video: { width, height },
};

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((stream) => {
    video$.srcObject = stream;

    video$.onloadedmetadata = () => {
      video$.play();

      requestAnimationFrame(drawVideoFrame);
    };
  })
  .catch(console.error);

function drawVideoFrame() {
  ctx.drawImage(video$, 0, 0, width, height);

  requestAnimationFrame(drawVideoFrame);
}
