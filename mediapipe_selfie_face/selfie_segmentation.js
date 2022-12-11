import { Camera } from "@mediapipe/camera_utils";
import { SelfieSegmentation } from "@mediapipe/selfie_segmentation";
import "./style.css";

const video$ = document.querySelector("video");
const canvas$ = document.querySelector("canvas");
const ctx = canvas$.getContext("2d");
const imagesBox$ = document.querySelector(".images-box");
const button$ = document.querySelector("button");

let img$ = null;

const onImagesBoxClick = (e) => {
  const newSelectedImage =
    e.target.localeName === "img" ? e.target : e.target.closest("img");
  if (!newSelectedImage) return;

  const prevSelectedImage = imagesBox$.querySelector(".selected");
  if (prevSelectedImage) {
    prevSelectedImage.classList.remove("selected");
  }

  newSelectedImage.classList.add("selected");
  img$ = newSelectedImage;
};

const onButtonClick = () => {
  img$ = null;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const selectedImage = imagesBox$.querySelector(".selected");
  if (selectedImage) {
    selectedImage.classList.remove("selected");
  }
};

imagesBox$.addEventListener("click", onImagesBoxClick);
button$.addEventListener("click", onButtonClick);

const WIDTH = (canvas$.width = window.innerWidth);
const HEIGHT = (canvas$.height = window.innerHeight);

function onResults(results) {
  // console.log(results);

  if (!img$) return;

  ctx.save();

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  ctx.drawImage(results.segmentationMask, 0, 0, WIDTH, HEIGHT);

  // перезаписываем существующие пиксели
  // ctx.globalCompositeOperation = "source-in";
  // ctx.fillStyle = "#00FF00";
  // ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.globalCompositeOperation = "source-out";
  ctx.drawImage(img$, 0, 0, WIDTH, HEIGHT);

  // записываем отсутствующие пиксели
  ctx.globalCompositeOperation = "destination-atop";
  ctx.drawImage(results.image, 0, 0, WIDTH, HEIGHT);

  ctx.restore();
}

const selfieSegmentation = new SelfieSegmentation({
  locateFile: (file) => `./node_modules/@mediapipe/selfie_segmentation/${file}`,
});
selfieSegmentation.setOptions({
  modelSelection: 1,
});
selfieSegmentation.onResults(onResults);

const camera = new Camera(video$, {
  onFrame: async () => {
    await selfieSegmentation.send({ image: video$ });
  },
  facingMode: undefined,
  width: WIDTH,
  height: HEIGHT,
});
camera.start();
