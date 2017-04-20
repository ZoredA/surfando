function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
  var color = "blue";
  if (item.color) {
    color = item.color;
  }
  console.log("coloring");
  document.body.style.border = "10px solid " + color;
}
console.log("Script loading");
var getting = browser.storage.local.get("color");
console.log(getting);
getting.then(onGot, onError);
