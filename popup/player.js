//runs the player

/*
Given the name of a beast, get the URL to the corresponding image.
*/
function beastNameToURL(beastName) {
  switch (beastName) {
    case "Frog":
      return browser.extension.getURL("beasts/frog.jpg");
    case "Snake":
      return browser.extension.getURL("beasts/snake.jpg");
    case "Turtle":
      return browser.extension.getURL("beasts/turtle.jpg");
  }
}

/*
Listen for clicks in the popup.

If the click is on one of the beasts:
  Inject the "beastify.js" content script in the active tab.

  Then get the active tab and send "beastify.js" a message
  containing the URL to the chosen beast's image.

If it's on a button which contains class "clear":
  Reload the page.
  Close the popup. This is needed, as the content script malfunctions after page reloads.
*/

document.addEventListener("click", (e) => {
  // //The user clicked on our audio player. 
  // //We need to figure out what button was clicked...
  // //We need to then tell the background script what took place.
  
  if (e.target.classList.contains("surfando")) {
    console.log('surfs up');
    console.log(e.target.name);
    if (e.target.name === 'test'){
      var src="https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg"
      var au = document.getElementById('player');
      au.src = src;
      au.load();
      au.play();
      return;
    }
    var sending = browser.runtime.sendMessage({'action':e.target.name});
    sending.then( function(response){
      console.log('sent');
      var link = document.createElement('a');
      link.href = response.song.song_url;
      link.innerHTML = response.song.song_name
      var div = document.getElementById('surfando_nowplay');
      div.innerHTML = '';
      var text = document.createElement('label');
      text.innerHTML = response.song.current_playlist + ' - #' + response.song.number + ' ';
      div.appendChild(text);
      div.appendChild(link);
      var text = document.createElement('label');
      text.innerHTML = ' by ' + response.song.artists_name;
      div.appendChild(text);

      //document.getElementById('surfando_player').appendChild(response.aud);
      },
      (err) => {console.log('err' + err)} );
  }
  else if (e.target.classList.contains("clear")) {
     browser.tabs.reload();
     window.close();
   }
});