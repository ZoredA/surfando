//This is the main background process file.
//The toolbar button communicates with this file
//and this in turn retrieves information from spotify
//and returns it as needed.

//initial steps
//we get token from settings
//if token is their and we can create an access token we set a please login variable to false.
var spotifyApi;
var pleaseLogin=true;
var userMessage = '';
var surfando; //contains all the settings. 
var init_done = false;
var aud; //The audio object.
var playlistManager; //type: PlayListManager
var renewalTried = false;

//We monitor changes. On change, we update our settings.
//https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/onChanged
browser.storage.onChanged.addListener( function (changes, area) {
  if (area !== "local"){
    return;
  }
  if (changes.surfando){
    //We changed the surfando settings
    surfando = changes.surfando.newValue;
    console.log('settings changed');
    if (!init_done){
      init();
    }
    else{
      //lots of race conditions here...
      if (aud){
        aud.pause(); //to keep from asking for another song when we don't have it.
      }
      playlistManager.reset(surfando);
      setup({'detail': surfando.playlists[0]});
      if (aud){
        aud.play();
      }
    }
  }
});

//The first function run
var init = function(){
  //The function run once we retrieved our settins.
  var onGet = function(item){
    if (!item || !item.surfando){
      userMessage = "Please save some settings prior to use.";
      init_done = false;
      return;
    }
    var refresh_token = item.surfando.refresh_token;
    if(!refresh_token){
      userMessage = "Please save a refresh token.";
      init_done = false;
      return;
    }
    surfando = item['surfando'];
    
    //Creating a playlist manager. 
    //The callbacks work as follows:
    //the playlist manager realizes we've run out of songs, so it makes 
    //a callback to our getSpotifyRecommendation function to request for more
    //which in turn returns some songs to the manager.
    
    var getReccomendationFunc = (options, callback) => { getSpotifyRecommendation(options, callback); };
    
    //A more elaborate error handler that checks if 
    //an error in the rec retrieval can be fixed by renewing a token.
    var errorHandler = function(err, callback){
        if (renewalTried){
          userMessage="Unable to renew token.";
          console.dir(err);
          return;
        }
        var resp = err.response;
        if (resp.error.message.includes('token expire')){
          refreshAuth(refresh_token, (err,data) => {
            if (!err){
              callback();
            }
          });
        }
        else{
          userMessage="Unable to get recommendations.";
          console.dir(err);
        }
    }
    
    playlistManager = new PlayListManager(
      surfando, 
      getReccomendationFunc,
      errorHandler);
    
    document.addEventListener("updateRecs", setup);
    
    spotifyApi = new SpotifyWebApi();
    refreshAuth(refresh_token, function(err, data){
      if (err){
        console.dir(err);
        init_done = false;
        return;
      }
      init_done = true;
      userMessage = '';
      console.dir(surfando);
      setup({'detail':playlistManager.default_playlist});
    });
    
    
  }
  
  var onError = function(err){
    console.dir(err);
    userMessage = "fatal error retrieving storage";
    init_done = false;
  }
  
  //This retrieves the playlist settings
  //as well the token.
  var getting = browser.storage.local.get('surfando');
  getting.then(onGet, onError);
  
}

var makeRequest = function(url, params, callback){
  var url = buildUrl(url, params);
  console.log('making request to ' + url);
  var pro = fetch(url).then(function(response) {  
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
      callback(err, false);
    });
  return pro;
}

var refreshAuth = function(refresh_token, callback){
  //We need to renew our token. So we make a local call to the server do so.
  makeRequest('http://localhost:8888/refresh_token', {'refresh_token':refresh_token}, 
    function(err, new_data){
      console.log(new_data);
      if (!err){
        renewalTried=false;
        var access_token = new_data.access_token;
        spotifyApi.setAccessToken(access_token);
        return callback(false, new_data);
      }
      userMessage = 'Unable to get access token';
      init_done = false;
      renewalTried=true;
      return callback(err, new_data);
    });
}

//If nothing is started, this will start it.
var startPlayBack = function(){
  var info = playlistManager.getCurrentInfo();
  while(!info.playback_url){
    playlistManager.songEnded(false); //We have to skip some songs because they lack preview urls...
    info = playlistManager.getCurrentInfo();
  }
  if (!aud){
    aud = new Audio(info.playback_url);
    var div = document.getElementById('play_div');
    div.appendChild(aud)//'<audio id="back_player" src="https://p.scdn.co/mp3-preview/277922cde7ef0b195d7c880bfe25a2cfb7bb52a2">');
    //document.getElementById('player').play();
    //aud = document.getElementById('back_player');
    aud.addEventListener("ended", 
      () => {
        playlistManager.songEnded(true);
        next();
      }, 
    true);
    aud.load();
  }
  aud.play();
  console.log('shou;ld be playing');
}

//This resumes the current song or
//starts playback if it wasn't already.
var play = function(){
  startPlayBack();
}

//This pauses the currently playing thing.
var pause = function(){
  if (aud){
    aud.pause();
  }
  console.log("we should be pausing:/");
  aud.pause();
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
  var info = playlistManager.getCurrentInfo();
  while(!info.playback_url){
    playlistManager.songEnded(false); //We have to skip some songs because they lack preview urls...
    info = playlistManager.getCurrentInfo();
  }
  console.log('setting aud in next');
  console.dir(info);
  aud.src = info.playback_url;
  aud.load();
  aud.play();
  return info;
}

var setup = function(e){
  console.log('in setup');
  console.dir(playlistManager.getParams(e.detail));
  getSpotifyRecommendation(playlistManager.getParams(e.detail), function(err, data){
    if (err){
      console.dir(err);
      //We call this thing which hopefully will call the error handler we assigned.
      return playlistManager.addRecommendation(err, false); 
    }
    if(!data){
      console.log('no data');
      return;
    }
    playlistManager.addRecommendation(false, data);
  })
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

var previous = function(){
  var info = playlistManager.previousSong();
  while(!info.playback_url){
    info = playlistManager.previousSong(); //We have to skip some songs because they lack preview urls...
  }
  console.log('setting aud in previous');
  console.dir(info);
  aud.src = info.playback_url;
  aud.load();
  aud.play();
  return info;
}

var handleButton = function(request, sender, sendResponse){
  if (!init_done){
    console.log('still initializing');
    console.log(userMessage);
    return sendResponse({'user_message':userMessage});
  }
  switch(request.action){ 
    case "play":
      play();
      break;
    case "pause":
      pause();
      break;
    case "next":
      playlistManager.songEnded(false);
      next();
      break;
    case "previous":
      previous();
      break;
    case "authenticate":
      authenticate();
      return sendResponse({});
    case "site":
      auth(request.url);
      return sendResponse({});
  }
  sendResponse({response: "Response from background script", "song":playlistManager.getCurrentInfo()});
}

function urlHander(e){
  if (!init_done){
    return;
  }
  var url = e.detail;
  console.log('switching to ' + url);
  playlistManager.switchedUrl(url);
}

browser.runtime.onMessage.addListener(handleButton);
document.addEventListener("DOMContentLoaded", init);
document.addEventListener("pageChange", urlHander);

//Sends the seed and any other information to
//spotify and gets back a playlist that we can play.
//This only returns one recommendation call. Has 
//to be called multiple times to generate the entire set of recommendations per playlist.
var getSpotifyRecommendation = function(options, callback){
  console.log('in get recs');
  console.log('init status:');
  console.log(init_done);
  console.dir(options);
  spotifyApi.getRecommendations(options, function(err, data){
     if (err){
      callback(err, false);
     }
    console.log('got data');
    callback(false, data);
  });
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
