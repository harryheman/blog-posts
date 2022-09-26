const quote = document.getElementById("quote");
const broadcastChannel = new BroadcastChannel("quote_channel");

broadcastChannel.addEventListener("message", ({ data }) => {
  console.log(data);
  quote.innerHTML = data;
});
