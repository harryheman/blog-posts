import "./style.css";

const [
  copyBox,
  copyBtn,
  pasteBox,
  pasteBtn,
  logBox,
  copyImgBtn,
  pasteImgBtn,
  textArea,
  notificationBtn,
] = [
  "copy-box",
  "copy-btn",
  "paste-box",
  "paste-btn",
  "log-box",
  "copy-img-btn",
  "paste-img-btn",
  "text-area",
  "notification-btn",
].map((id) => document.getElementById(id));

notificationBtn.addEventListener("click", () => {
  Notification.requestPermission();
});

let notification;
let notificationTimeoutId;

function createNotification() {
  const title = "Page is hidden";
  const options = {
    body: "MySite.com is not visible",
    icon: "/notification.png",
  };
  notification = new Notification(title, options);

  notification.addEventListener(
    "click",
    (e) => {
      console.log(e.target);
      logBox.textContent = "Notification clicked";
    },
    {
      once: true,
    }
  );

  notificationTimeoutId = setTimeout(() => {
    notification.close();
    clearTimeout(notificationTimeoutId);
    notification = null;
    notificationTimeoutId = null;
  }, 3000);
}

const someData = {
  a: 1,
  b: 2,
};

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    const searchParams = new URLSearchParams(Object.entries(someData));

    try {
      const result = navigator.sendBeacon(
        "https://example.com/beacon",
        searchParams
      );
      console.log(result);
    } catch (e) {
      console.error(e);
    }

    if (Notification.permission === "granted") {
      createNotification();
    }
  } else if (document.visibilityState === "visible") {
    if (notification) {
      notification.close();
      notification = null;

      if (notificationTimeoutId) {
        clearTimeout(notificationTimeoutId);
        notificationTimeoutId = null;
      }
    }
  }
});

async function copyText() {
  let textToCopy;

  const selectedText = getSelection().toString().trim();

  selectedText
    ? (textToCopy = selectedText)
    : (textToCopy = copyBox.textContent.trim());

  if (!textToCopy) {
    logBox.textContent = "No text to copy";
    return;
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    logBox.textContent = "Copy success";
  } catch (e) {
    console.error(e);
    logBox.textContent = "Copy error";
  }
}

async function pasteText() {
  try {
    const textToPaste = await navigator.clipboard.readText();
    if (!textToPaste) {
      logBox.textContent = "No text to paste";
      return;
    }
    pasteBox.textContent = textToPaste;
    logBox.textContent = "Paste success";
  } catch (e) {
    console.error(e);
    logBox.textContent = "Paste error";
  }
}

copyBtn.addEventListener("click", copyText);
pasteBtn.addEventListener("click", pasteText);

// const text = "Text to copy";
// const type = "text/plain";
// const blob = new Blob([text], { type });
// const data = {
//   [type]: blob,
// };
// const item = new ClipboardItem(data);
// await navigator.clipboard.write([item]);
// const _blob = await item.getType(type);
// const _text = await _blob.text();
// console.log(text); // Text to copy

const IMG_TYPE = "image/png";

async function copyRemoteImg() {
  try {
    const response = await fetch(
      "https://images.unsplash.com/photo-1529788295308-1eace6f67388?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80"
    );

    const blob = new Blob([await response.blob()], { type: IMG_TYPE });

    const item = new ClipboardItem({ [blob.type]: blob });

    await navigator.clipboard.write([item]);

    logBox.textContent = "Copy image success";
  } catch (e) {
    console.error(e);
    logBox.textContent = "Copy image error";
  }
}

async function pasteRemoteImg() {
  const imageBlobs = [];

  try {
    const items = await navigator.clipboard.read();

    for (const item of items) {
      for (const type of item.types) {
        const blob = await item.getType(type);

        if (blob.type.startsWith("image")) {
          imageBlobs.push(blob);
        }
      }
    }

    if (imageBlobs.length) {
      imageBlobs.forEach((blob) => {
        const img = document.createElement("img");
        img.width = 320;
        img.src = URL.createObjectURL(blob);
        document.body.append(img);
      });

      logBox.textContent = "Paste image success";
      return;
    }

    logBox.textContent = "No images to paste";
  } catch (e) {
    console.error(e);
    logBox.textContent = "Paste image error";
  }
}

copyImgBtn.addEventListener("click", copyRemoteImg);
pasteImgBtn.addEventListener("click", pasteRemoteImg);

function onCopy(e) {
  e.preventDefault();

  const selection = getSelection().toString().trim();

  if (!selection) return;

  e.clipboardData.setData("text/plain", `${selection}\ncopied from MySite.com`);
}

function onPaste(e) {
  e.preventDefault();

  const text = e.clipboardData.getData("text").trim();

  if (!text) return;

  e.target.value += text.toUpperCase();
}

textArea.addEventListener("copy", onCopy);
textArea.addEventListener("paste", onPaste);

const howLong =
  (fn) =>
  async (...args) => {
    const start = performance.now();
    const result = await fn(...args);
    console.log(`@result of ${fn.name}`, result);
    const difference = performance.now() - start;
    console.log("@time taken", difference);
  };

const getFactorial = (n) => (n <= 1 ? 1 : n * getFactorial(n - 1));
howLong(getFactorial)(12);

const fetchSomething = (url) => fetch(url).then((r) => r.json());
howLong(fetchSomething)("https://jsonplaceholder.typicode.com/users?_limit=10");
