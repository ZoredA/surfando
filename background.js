//import * as SpotifyWebApi from 'spotify-web-api-js';

//var spotify = new SpotifyWebApi();
var spotifyApi;
//console.dir(spotifyApi);
var refresh_token;

var aud;//  = new Audio("https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg");

//If nothing is started, this will start it.
var startPlayBack = function(){
  if (!aud){
    aud = new Audio("https://p.scdn.co/mp3-preview/277922cde7ef0b195d7c880bfe25a2cfb7bb52a2");
    var div = document.getElementById('play_div');
    div.appendChild(aud)//'<audio id="back_player" src="https://p.scdn.co/mp3-preview/277922cde7ef0b195d7c880bfe25a2cfb7bb52a2">');
    //document.getElementById('player').play();
    //aud = document.getElementById('back_player');
    aud.addEventListener("ended", next, true);
  }
  aud.play();
  console.log('shou;ld be playing');
}

//This resumes the current song or
//starts playback if it wasn't already.
var play = function(){
  console.log(spotifyApi);
  startPlayBack();
  var z = new SpotifyWebApi();
  console.log(z);
}

//This pauses the currently playing thing.
var pause = function(){
  if (aud){
    aud.pause();
  }
  console.log("we should be pausing:/");
  aud.pause();
  console.dir(aud);
}

var authenticate = function(){
  //open a new tab!
  browser.tabs.create({
    "url":"http://localhost:8888/login"
  });
  
}

var auth = function(url){
  console.log(url);
  var getting = browser.storage.local.get("callback");

}

var current = 0;
//This skips songs to the next one.
var next = function(){
  console.log("in next");
  // aud.src = "https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg";
  // aud.load();
  // aud.play();
  aud.src = test_data['tracks'][current]['preview_url'];
  aud.load();
  aud.play();
  current=current+1;
}

var refreshAuth(refresh_token, callback){
  //We need to renew our token. So we make a local call to the server do so.
  makeRequest('http://localhost:8888/refresh_token', {'refresh_token':refresh_token}, 
    function(err, new_data){
      console.log(data);
      if (!err){
        callback(data);
      }
    });
}

var setup = function(){
  console.log('in setup');
  
  getSpotifyRecommendation(function(err, data){
    if (err){
      //We see if we can try to renew and call again
      var resp = err.reponse;
      if (resp.error.message.includes('token expire')){
        refreshAuth(refresh_token);
      }
    }
    dat = data;
  })
}

var makeRequest = function(url, params, callback){
  var url = buildUrl(url, params);
  fetch(url).then(function(response) {  
        if (response.status !== 200) {  
          console.log('Looks like there was a problem. Status Code: ' +  
            response.status);  
          console.dir(response);
          return callback(response);  
        }
        // Examine the text in the response  
        response.json().then(function(data) {  
          callback(false, data);  
        });  
      }  ).catch(function(err) {  
      console.log('Fetch Error :-S', err);  
    });
}

//Reference: http://stackoverflow.com/a/1714899
var buildUrl = function(url, params, prefix){
  var str = [], p;
  for(p in params) {
    if (params.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = params[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return url + '?' + str.join("&");
}

var handleButton = function(request, sender, sendResponse){
  
  switch(request.action){ 
    case "setup":
      setup();
      break;
    case "play":
      play();
      break;
    case "pause":
      pause();
      break;
    case "next":
      next();
      break;
    case "authenticate":
      authenticate();
      return sendResponse({});
    case "site":
      auth(request.url);
      return sendResponse({});
  }
  sendResponse({response: "Response from background script", 'aud':aud, "song":aud.src});
}

browser.runtime.onMessage.addListener(handleButton);

//This is the main background process file.
//The toolbar button communicates with this file
//and this in turn retrieves information from spotify
//and returns it as needed.

//Run at startup, for initial reading of the settings.
//Also perhaps run later as needed.
var readConfig = function(){
}

//Sends the seed and any other information to
//spotify and gets back a playlist that we can play.
//This only returns one recommendation call. Has 
//to be called multiple times to generate the entire set of recommendations per playlist.
var getSpotifyRecommendation = function(callback, access_token){
  var seed = {
    'seed_artists':['43ZHCT0cAZBISjO8DG9PnE']
  };
  var access_token= access_token || '';
  
  var sp = new SpotifyWebApi();
  sp.setAccessToken(access_token);
  console.log(sp.getAccessToken());
  sp.getRecommendations(seed, function(err, data){
     if (err){
      callback(err, false);
     }
    console.log('got data');
    callback(false, data);
  });
} 

var dat;

//Updates the seed. If a user played a song for long
//enough it gets updated into the seed. Otherwise,
//it is not done so. In addition if a user has set 5 permanent
//seeds, we can't set a new one, so we do nothing then too.
//This expects play duration of the song as well as the song
//in question.
var updateSeed = function(){
}

//Returns all of the playlists. 
var getPlaylists = function(){
  return ['sup'];
}


//Reference: https://developer.spotify.com/web-api/get-recommendations/

var test_data = {
	"tracks": [{
		"artists": [{
			"external_urls": {
				"spotify": "https://open.spotify.com/artist/134GdR5tUtxJrf8cpsfpyY"
			},
			"href": "https://api.spotify.com/v1/artists/134GdR5tUtxJrf8cpsfpyY",
			"id": "134GdR5tUtxJrf8cpsfpyY",
			"name": "Elliphant",
			"type": "artist",
			"uri": "spotify:artist:134GdR5tUtxJrf8cpsfpyY"
		}, {
			"external_urls": {
				"spotify": "https://open.spotify.com/artist/1D2oK3cJRq97OXDzu77BFR"
			},
			"href": "https://api.spotify.com/v1/artists/1D2oK3cJRq97OXDzu77BFR",
			"id": "1D2oK3cJRq97OXDzu77BFR",
			"name": "Ras Fraser Jr.",
			"type": "artist",
			"uri": "spotify:artist:1D2oK3cJRq97OXDzu77BFR"
		}],
		"disc_number": 1,
		"duration_ms": 199133,
		"explicit": false,
		"external_urls": {
			"spotify": "https://open.spotify.com/track/1TKYPzH66GwsqyJFKFkBHQ"
		},
		"href": "https://api.spotify.com/v1/tracks/1TKYPzH66GwsqyJFKFkBHQ",
		"id": "1TKYPzH66GwsqyJFKFkBHQ",
		"is_playable": true,
		"name": "Music Is Life",
		"preview_url": "https://p.scdn.co/mp3-preview/546099103387186dfe16743a33edd77e52cec738",
		"track_number": 1,
		"type": "track",
		"uri": "spotify:track:1TKYPzH66GwsqyJFKFkBHQ"
	}, {
		"artists": [{
			"external_urls": {
				"spotify": "https://open.spotify.com/artist/1VBflYyxBhnDc9uVib98rw"
			},
			"href": "https://api.spotify.com/v1/artists/1VBflYyxBhnDc9uVib98rw",
			"id": "1VBflYyxBhnDc9uVib98rw",
			"name": "Icona Pop",
			"type": "artist",
			"uri": "spotify:artist:1VBflYyxBhnDc9uVib98rw"
		}],
		"disc_number": 1,
		"duration_ms": 187026,
		"explicit": false,
		"external_urls": {
			"spotify": "https://open.spotify.com/track/15iosIuxC3C53BgsM5Uggs"
		},
		"href": "https://api.spotify.com/v1/tracks/15iosIuxC3C53BgsM5Uggs",
		"id": "15iosIuxC3C53BgsM5Uggs",
		"is_playable": true,
		"name": "All Night",
		"preview_url": "https://p.scdn.co/mp3-preview/9ee589fa7fe4e96bad3483c20b3405fb59776424",
		"track_number": 2,
		"type": "track",
		"uri": "spotify:track:15iosIuxC3C53BgsM5Uggs"
	}],
	"seeds": [{
		"initialPoolSize": 500,
		"afterFilteringSize": 380,
		"afterRelinkingSize": 365,
		"href": "https://api.spotify.com/v1/artists/4NHQUGzhtTLFvgF5SZesLK",
		"id": "4NHQUGzhtTLFvgF5SZesLK",
		"type": "artist"
	}, {
		"initialPoolSize": 250,
		"afterFilteringSize": 172,
		"afterRelinkingSize": 144,
		"href": "https://api.spotify.com/v1/tracks/0c6xIDDpzE81m2q797ordA",
		"id": "0c6xIDDpzE81m2q797ordA",
		"type": "track"
	}]
}
