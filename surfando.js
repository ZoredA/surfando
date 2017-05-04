function onError(error) {
  console.log(`Error: ${error}`);
}

function onGot(item) {
  var color = "blue";
  if (item.color) {
    color = item.color;
  }
  console.log("coloring");
  if (window.location.href.includes('localhost')){
    color = "red";
  }
  document.body.style.border = "10px solid " + color;

}

console.log("Script loading");
var getting = browser.storage.local.get("color");
console.log(getting);
getting.then(onGot, onError);

// var site = browser.storage.local.get("url");
// getting.then(function(item){
  // var call_url = "http://localhost:8888/login";
  // if (item.url){
    // call_url = item.url;
  // }
  // if (window.location.href.includes(call_url)){
    // var sending = browser.runtime.sendMessage({
      // 'action':'site',
      // 'url':window.location.href
    // });
  // }
// },
// (err) => {console.log(err);});