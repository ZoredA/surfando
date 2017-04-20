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

function createMainInput(id_precursor){
  var id_precursor = id_precursor || '_';
  var parentDiv = document.getElementById('main_input');
  //We need a seed box
  //We need a urls box
  var row = document.createElement('div');
  row.setAttribute("class", "row");
  parentDiv.appendChild(row);
  
  var column = document.createElement('div');
  column.setAttribute("class", "six columns");
  
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

//https://www.w3schools.com/jsref/dom_obj_input.asp
function createSliders(){
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
  var divs = document.getElementById('sliders');
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
      
      var input = document.createElement('INPUT');
      input.setAttribute("id", key);
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
createMainInput();
createSliders();
//document.addEventListener("DOMContentLoaded", restoreOptions);
//document.querySelector("form").addEventListener("submit", saveOptions);
