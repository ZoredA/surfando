//class that stores the playlists, where we currently are and helps facilitate switching between them
class PlayListManager {
    constructor(playlists_info, rec_callback) {
        console.log('constructing');
        this.playlists_info = playlists_info;
        this.urls = {};
        this.current_playlist = playlists_info.playlists[0]; 
        this.playlist_index = {}; //index of currently playing song per playlist.
        //https://www.npmjs.com/package/url-pattern
        this.pattern = new UrlPattern('(http(s)\\://)(:subdomain.):domain.:tld(\\::port)(/*)');
        //This gets us ids we can use for seeds! And also helps us figure out if it is an artist or a track
        //sample artist:
        //https://open.spotify.com/artist/1VBflYyxBhnDc9uVib98rw
        //sample track:
        //https://open.spotify.com/track/15iosIuxC3C53BgsM5Uggs
        this.id_pattern = new UrlPattern('(http(s)\\://)open.spotify.com/(:category)/(:id)(/*)(?*)') ;
        this.recommendation = {};
        this.rec_callback = rec_callback; //The function we call when we run out of recommendations.
        //{playlist: {pinned:[], rolling:[]}
        this.seeds = {};
        this.url = '';
        this.default_playlist =  playlists_info.playlists[0]; //temporary should be settable
        this.working = true;
        this.previous_playlist;
        this.setup();
    }
    
    _getCurrentPlaylist(){
      if (!this.previous_playlist){
        this.previous_playlist = this.default_playlist;
      }
      if (this.working){
        return this.previous_playlist;
      }
      return this.current_playlist;
    }
    
    _transition(new_playlist){
      this.working = true;
      this.previous_playlist = this.current_playlist;
      this.current_playlist = new_playlist;
      this._checkRecommendations(new_playlist);
    }
    
    _transition_over(){
      this.working = false;
    }
    
    _send_event(playlist){
        var event = new CustomEvent('updateRecs', {'playlist':playlist});
        document.dispatchEvent(event);
    }
    
    //If we don't have any recommendations for the playlist we plan to move into
    //we emit the event that asks for some.
    _checkRecommendations(playlist){
      console.log('checking ' + playlist);
      if (!this.recommendation[playlist] || this.recommendation[playlist].length < 1){
        this._send_event(playlist);
      }
      else{
        this._transition_over();
      }
    }
    
    reset(new_info){
      this.playlists_info = new_info;
      this.seeds = {};
      this.recommendation = {};
      this.playlist_index = {}; 
      this.setup();
    }
    
    //Creates the internal playlist datastructures
    setup(){
      //Need a url map
      var playlists = this.playlists_info.playlists;
      console.log(playlists);
      var urls = {};
      for (var i = 0; i < playlists.length; i++){
        var playlist = playlists[i];
        var playlist_info = this.playlists_info[playlist];
        for(var j = 0; j < playlist_info.urls.length; j++){
          //we store the subdoman and domain for each url in the playlist.
          var url_info = this.pattern.match(playlist_info.urls[j]);
          if (!url_info) {continue;}
          var key = url_info.subdomain ? url_info.subdomain  + '.' + url_info.domain : url_info.domain;
          
          if (urls[key]){
            continue; //We can only map one url to a playlist.
          }
          urls[key] = playlist;
        }
        this.seeds[playlist] = {
          pinned:[], 
          rolling:[]
        };
        //console.dir(playlist_info.seeds);
        for(var j = 0; j < playlist_info.seeds.length; j++){
          var seed_info = this.id_pattern.match(playlist_info.seeds[j]);
          if (!seed_info) {
            continue;
          }
          this.seeds[playlist].rolling.push(seed_info);  
        }
        this.playlist_index[playlist] = 0;
      }
      this.urls = urls;
      
      console.log('ugh done setup');
    }
    
    //Returns a playlist if a url matches. 
    urlMatch(url){
      var url_info = this.pattern.match(url);
      if (!url_info){
        return false;
      }
      var sub_dom = url_info.subdomain ? url_info.subdomain  + '.' + url_info.domain : url_info.domain;
      
      if (this.urls[sub_dom]){
        return this.urls[sub_dom]
      }
      return false;
    }
    
    switchedUrl(url){
      var playlist = this._getCurrentPlaylist();
      //First we check if the new url is in our match list
      //We only care about a new song when songEnded is called.
      var new_playlist = this.urlMatch(url);
      if (!new_playlist){
          //we do nothing.
          return;
      }
      if (new_playlist === playlist){
        //We do nothing because we are still in the same playlist.
        return;
      }
      //this.current_playlist = new_playlist;
      this._transition(new_playlist);
      
    }
    
    addRecommendation(err, recs){
      if (err){
        return this.error_callback(err, () => {
          var event = new CustomEvent('updateRecs', {'playlist':this.current_playlist});
          document.dispatchEvent(event);
        });
      }
      var playlist = this.current_playlist;
      this.recommendation[playlist] = recs.tracks;
      this.playlist_index[playlist] = 0;
      this._transition_over();
    }
    
    //The song has ended. We update the current playlist's index
    //liked denotes whether the user liked it or not (likely by virtue of them pressing the next button or not doing so)
    songEnded(liked){
      var playlist = this._getCurrentPlaylist();
      if (liked){
        
        //The song was liked, so we add it to the rolling list~
        var song_info = this.getCurrentInfo();
        console.log(song_info.song_name + ' was liked');
        var seed_info = this.id_pattern.match(song_info.song_url);
        this.seeds[playlist].rolling.push(seed_info);  
        var max_length = 5 - this.seeds[playlist].pinned.length;
        if (this.seeds[playlist].rolling.length > max_length){
          this.seeds[playlist].rolling = this.seeds[playlist].rolling.slice(1); //We slice off the first element
        }
      }
      this.playlist_index[playlist] = this.playlist_index[playlist] + 1;

      if (this.playlist_index[playlist]  >= (this.recommendation[playlist].length - 1) ){
        console.log('updating recs');
        //Our index has hit the 2nd last song or later so we need to callback the function that will populate us with
        //more reccomendations.
        
        //We hit the event that will give us more recommendations.
        this._send_event(playlist);
      }
      return;
    }
    
    getParams(playlist){
      //Our params object will look like:
      //{
          // 'seed_artists':[],
          // 'seed_tracks':[],
          // 'seed_genres':[],
          // all other parameters
      //}
      var params = {};
      //We assume that we'd only 
      var playlist = playlist || this._getCurrentPlaylist();
      var temp = this.seeds[playlist].pinned.concat( this.seeds[playlist].rolling );
      console.log(temp);
      temp.forEach( function(seed_info) {
        switch(seed_info.category){
          case "artist":
            if (!params.seed_artists) params.seed_artists = [];
            params.seed_artists.push(seed_info.id);
            break;
          case "track":
            if (!params.seed_tracks) params.seed_tracks = [];
            params.seed_tracks.push(seed_info.id);
            break;
          case "genres":
            if (!params.seed_genres) params.seed_genres = [];
            params.seed_genres.push(seed_info.id);
            break;
        }
      });
      console.log(playlist);
      console.log('returning from params ' + JSON.stringify(params));
      if (!params.seed_artists && !params.seed_tracks && !params.seed_grens){
        return {'seed_artists':['43ZHCT0cAZBISjO8DG9PnE']};
      }
      
      
      //console.log(params);
      return params;
    }
    
    getCurrentInfo(){
      //Returns
      // {
        // 'playback_url',
        // 'artists_name',
        // 'song_name',
        // 'song_url'
      // }
      var playlist = this._getCurrentPlaylist();
      var index = 0;
      if (this.playlist_index[playlist]  >= this.recommendation[playlist].length){
        console.log('final element reached. returning first one');
        console.log(this.playlist_index[playlist]);
        var info = this.recommendation[playlist][0];
      }
      else{
        index = this.playlist_index[playlist];
        var info = this.recommendation[playlist][index];
      }
      
      return this.createInfoObj(info, index);
    }
    
    getNextInfo(){
      //Returns
      // {
        // 'playback_url',
        // 'artist_name',
        // 'song_name',
        // 'song_url'
      // }
      var playlist = this._getCurrentPlaylist();
      var index = 1;
      if (this.playlist_index[playlist]  >= this.recommendation[playlist].length){
        console.log('final element reached. returning second one');
        console.log(this.playlist_index[playlist]);
        var info = this.recommendation[playlist][1];
      }
      else{
        index = this.playlist_index[playlist] + 1;
        var info = this.recommendation[playlist][index];
      }
      return this.createInfoObj(info, index);
    }
    
    createInfoObj(info, index){
      var artists = [];
      info.artists.forEach(function(artist){
        artists.push(artist.name);
      });
      
      var ret_obj = {
        'playback_url':info.preview_url,
        'artists_name': artists.join('-'),
        'song_name':info.name,
        'song_url':info.external_urls.spotify,
        'current_playlist':this._getCurrentPlaylist(),
        'number':index
      };
      
      return ret_obj;
    }
    
}