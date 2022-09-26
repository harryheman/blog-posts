const video = document.getElementById("video");
const broadcastChannel = new BroadcastChannel("quote_channel");
const quote = document.getElementById("quote");
const shareButton = document.getElementById("share-button");

let quoteText;

document.addEventListener("visibilitychange", () => {
  // console.log(document.visibilityState);
  if (document.visibilityState === "visible") {
    video.play();
  } else {
    video.pause();
  }
});

const getQuote = async () => {
  if (document.visibilityState !== "visible") return;

  try {
    const response = await fetch("https://api.quotable.io/random");
    const { content, author, dateAdded } = await response.json();
    const parsedQuote = `<q>${content}</q> <br> <p>- ${author}</p> <br> <p>Added on ${formatDate(
      dateAdded
    )}</p>`;
    quote.innerHTML = parsedQuote;
    quoteText = content;
    broadcastChannel.postMessage(parsedQuote);
  } catch (e) {
    console.error(e);
  }
};

getQuote();

setInterval(getQuote, 10000);

const shareQuote = async (data) => {
  try {
    await navigator.share(data);
  } catch (e) {
    console.error(e);
  }
};

shareButton.addEventListener("click", () => {
  const data = {
    title: "A Beautiful Quote",
    text: quoteText,
    url: location.href,
  };

  shareQuote(data);
});

const logDate = (locale = []) => {
  const date = new Date("2022-11-10");
  const dateTime = new Intl.DateTimeFormat(locale, { timeZone: "UTC" });
  const formattedDate = dateTime.format(date);
  console.log(formattedDate);
};

logDate(); // 10.11.2022
logDate("en-US"); // 11/10/2022
logDate("de-DE"); // 10.11.2022
logDate("zh-TW"); // 2022/11/10

function formatDate(dateString) {
  const date = new Date(dateString);
  const dateTime = new Intl.DateTimeFormat([], { timeZone: "UTC" });
  return dateTime.format(date);
}

const getDateWithHoursAndMinutes = (date) =>
  new Intl.DateTimeFormat([], {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
console.log(getDateWithHoursAndMinutes(new Date())); // 23.09.2022, 21:30
