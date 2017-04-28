var tuneables = {
    'acousticness':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Acousticness'
      },
    'danceability':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Danceability'
      },
    'duration_ms':{
      'type':'int',
      'display':'Duration (ms)'
      },
    'energy':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Energy'
      },
    'instrumentalness':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Instrumentalness'
      },
    'key':{
      'type':'int',
      'display':'Key'
      },
    'liveness':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Liveness'
      },
    'loudness':{
      'typical':[-60,0],
      'type':'float',
      'display':'Loudness'
      },
    'mode':{
      'type':'int',
      'display':'Mode'
      },
    'popularity':{
      'min':0,
      'max':100,
      'type':'int',
      'display':'Popularity'
      },
    'speechiness':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Speechiness'
      },
     'tempo':{
      'type':'float',
      'display':'Tempo'
      },
     'time_signature':{
      'type':'int',
      'display':'Time Signature'
      },
     'valence':{
      'min':0.0,
      'max':1.0,
      'type':'float',
      'display':'Valence'
      }
 };

function saveOptions(e) {
  e.preventDefault();
  browser.storage.local.set({
    color: document.querySelector("#color").value
  });
}

function restoreOptions() {

  function setCurrentChoice(result) {
    document.querySelector("#color").value = result.color || "blue";
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  var getting = browser.storage.local.get("color");
  getting.then(setCurrentChoice, onError);
}

//This returns a list of playlists.
function getPlaylists(){
  //Temporary
  return [
    'work',
    'play',
    'relax'
  ];
}

function setup(){
  var select = document.getElementById('playlist_select');
  getPlaylists().forEach(function(item){
    var option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    select.appendChild(option);
    //createMainInput(item);
    createSettings(item);
    createMainInput(item);
    createSliders(item);
  });
  
  var removeButton = document.getElementById('remove_playlist');
  removeButton.onclick = function(event){
    removeSettings(select.options[select.selectedIndex].textContent);
    select.remove(select.selectedIndex);
    
  }
  
  var addButton = document.getElementById('add_playlist');
  addButton.onclick = function(event){
    //select.remove(select.selectedIndex);
    var text = document.getElementById("new_playlist_text").value;
    var option = document.createElement('option');
    option.value = text;
    option.textContent = text;
    select.appendChild(option);
    select.selectedIndex = (select.options.length - 1);
    createSettings(text);
  }
  
  var onChange = function(event){
    //Hide all the previous spans except one
    var selectedPlaylist = select.options[select.selectedIndex].textContent;
    console.log("Current: " + selectedPlaylist);
    hideAllSettingsButOne(selectedPlaylist);
  }
  select.onchange = onChange;
  
}

function hideAllSettingsButOne(exclude){
  var parentDiv = document.getElementById('settings');
  var children = parentDiv.children;
  var excludeSpan = exclude + '_span';
  for (var i =0; i < children.length; i++){
      if (children[i].tagName === 'SPAN'){
        if (children[i].getAttribute('id') === excludeSpan){
          children[i].style.display = "initial";
        }
        else{
          children[i].style.display = "none";
        }
      }
  }
}

function createSettings(id_precursor){
  //First we grab the main settings div
  var parentDiv = document.getElementById('settings');
  //Then we make a span we can hide or unhide as needed.
  var newSpan = document.createElement('span');
  newSpan.setAttribute("id", id_precursor+'_span');
  
  //Need two divs and a hr inbetween
          // <div id="main_input"></div>
          // <hr class="style17">
          // <div id="sliders"></div>
          
  var mainInput = document.createElement('div');
  mainInput.setAttribute("id", id_precursor+"_main_input");
  
  var line = document.createElement('hr');
  line.setAttribute("class", "style17");
  
  var sliders = document.createElement('div');
  sliders.setAttribute("id", id_precursor+"_sliders");
  
  newSpan.appendChild(mainInput);
  newSpan.appendChild(line);
  newSpan.appendChild(sliders);
  
  newSpan.style.display = "none";
  //Append the span to the parent.
  parentDiv.appendChild(newSpan);
  
}

function removeSettings(id_precursor){
  var span = docoument.getElementById(id_precursor+'_span');
  span.remove();
}

function createMainInput(id_precur){
  //var id_precursor = id_precursor || '_';
  var parentDiv = document.getElementById(id_precur + '_main_input');
  //We need a seed box
  //We need a urls box
  
  var createAddingDivs = function(id_precursor, labelText){
    var row = document.createElement('div');
    row.setAttribute("class", "row");
    parentDiv.appendChild(row);
    
    var column = document.createElement('div');
    column.setAttribute("class", "six columns");

    var label = document.createElement('label');
    label.innerHTML = labelText;
    column.appendChild(label);
    
    row.appendChild(column);
    

    
    //Urls box, we have a small url box for adding and a larger list
    // [type url] (+)
    // [url, url2,url3] (edit) (remove) 
    var add_url = document.createElement('input');
    add_url.setAttribute('type', 'url');
    add_url.setAttribute('id', id_precursor + '_add_url');
    
    var buttonHandler = function(){
      var input_field = document.getElementById(id_precursor + '_add_url')
      var entry = input_field.value;
      if (!entry || entry === ''){
        return;
      }
      var text_div = document.getElementById(id_precursor + '_text_div');
      //We create a new text input and a button and put them into a div
      //so we can set the column size of the div.
      var entry_div = document.createElement('div');
      entry_div.setAttribute("class","u-full-width");
      text_div.appendChild(entry_div);
      
      var text_field = document.createElement('input');
      text_field.setAttribute('type', 'url');
      
      //var text_field = document.getElementById(id_precursor + '_url_box');
      text_field.value = entry;
      text_field.setAttribute('class', id_precursor + '_text_field');
      
      entry_div.appendChild(text_field);
      
      var sub_button = document.createElement('input');
      sub_button.setAttribute('type', 'button');
      sub_button.setAttribute('value', '-');
      
      sub_button.onclick = function(event){
        entry_div.remove();
      }
      entry_div.appendChild(sub_button);
      input_field.value="";
    }
    
    var add_button = document.createElement('input');
    add_button.setAttribute('type', 'button');
    add_button.setAttribute('value', 'Add');

    add_button.onclick = buttonHandler;
    
    var text_div = document.createElement('div');
    text_div.setAttribute('id', id_precursor + '_text_div');
    
    column.appendChild(add_url);
    column.appendChild(add_button);
    column.appendChild(text_div);
    
  }
  
  createAddingDivs(id_precur+'_urls', id_precur+' Urls');

  createAddingDivs(id_precur+'_seeds', id_precur+' Seeds');
  
}

//https://www.w3schools.com/jsref/dom_obj_input.asp
function createSliders(id_precursor){
  var divs = document.getElementById(id_precursor + '_sliders');
  //divs.appendChild(document.createElement('br'))
  count = 0;
  var currentRow;
  for (const key of Object.keys(tuneables)){
      if (count % 3 == 0){
        var row = document.createElement('div');
        row.setAttribute("class", "row");
        divs.appendChild(row);
        currentRow = row;
      }
      count += 1;
      
      var column = document.createElement('div');
      column.setAttribute("class", "three columns");
      currentRow.appendChild(column);
      
      var checkbox = document.createElement('INPUT');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('class', id_precursor+'_checkbox');
      checkbox.value = key;
      checkbox.name = key;
      
      
      column.appendChild(checkbox);
      
      var input = document.createElement('INPUT');
      input.setAttribute("id", id_precursor+ '_' + key);
      
      var label = document.createElement('label');
      label.innerHTML = tuneables[key].display || key;
      label.setAttribute("for", input.getAttribute("id"));
      
      column.appendChild(label);
      
      
      if ('min' in tuneables[key]){
        var min = tuneables[key].min;
        var max = tuneables[key].max;
        var middle = (min + max) / 2.0;
        
        // var label = document.createElement('label');
        // label.innerHTML = `min:  ${min} `;
        // label.setAttribute("for", input.getAttribute("id"));
        // column.appendChild(label);
        
        input.setAttribute("type", "range");
        input.setAttribute("min", min);
        input.setAttribute("max", max);
        input.setAttribute("value", middle);
        input.setAttribute("step",(min+max)/100.0);
        //http://stackoverflow.com/a/18936328
        input.setAttribute("oninput", `${input.getAttribute("id")}`+'_output.value='+`${input.getAttribute("id")}`+'.value')
        column.appendChild(input);
        var output = document.createElement('output');
        output.setAttribute('id', `${input.getAttribute("id")}`+'_output');
        
        column.appendChild(output);
        
        // var label = document.createElement('label');
        // label.innerHTML = `max:  ${max}`;
        // column.appendChild(label);
      }
      else{
        input.setAttribute("type", "number");
        column.appendChild(input);
      }
      //divs.appendChild(document.createElement('br'))
  }

}

//This retrieves all of the settings for each playlist.
function saveSettings(e){
  e.preventDefault();
  console.log('saving');
  var data = {};
  getPlaylists().forEach(function(item){
    data[item] = {
      'urls':[],
      'seeds':[],
      'parms':{}
    };
    
    var mainDiv = document.getElementById(item + '_main_input');
    
    var urlsClasses = '.' + item + '_urls_text_field';
    console.log(urlsClasses);
    var urlTexts = mainDiv.querySelectorAll(urlsClasses);
    
    if (urlTexts && urlTexts.length > 0){
      urlTexts.forEach( (node) => {data[item]['urls'].push(node.value);})
    }
    
    
    var seedClasses = '.' + item + '_seeds_text_field';
    console.log(seedClasses);
    var seedTexts = mainDiv.querySelectorAll(seedClasses);
    if (seedTexts && seedTexts.length > 0){
      //console.dir(seedTexts);
      seedTexts.forEach( (node) => {data[item]['seeds'].push(node.value);})
    }
    
    var slidersDiv = document.getElementById(item + "_sliders");
    var checkBoxClass = '.' + item + '_checkbox';
    var checkBoxes = slidersDiv.querySelectorAll(checkBoxClass);
    
    checkBoxes.forEach ( (checkbox) => {
      if (checkbox.checked){
        data[item]['parms'][checkbox.name] = document.getElementById(item + '_' + checkbox.name).value;
      }
    })
    //Collect the urls
    //Collect the seeds
    //Collect the tuneables.
  })
  console.dir(data);
}

setup();
//createMainInput('urls');
//createMainInput('seeds');
//createSliders();

//document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveSettings);
