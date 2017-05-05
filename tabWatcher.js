//Code based on https://github.com/mdn/webextensions-examples/tree/master/chill-out
var DELAY = 0.5; //We consider an active tab one for which they've been on for 2 minutes or more.

/*
Restart alarm for the currently active tab, whenever background.js is run.
*/
var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
gettingActiveTab.then((tabs) => {
  restartAlarm(tabs[0].id);
});

/*
Restart alarm for the currently active tab, whenever the user navigates.
*/
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) {
    return;
  }
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    if (tabId == tabs[0].id) {
      restartAlarm(tabId);
    }
  });
});

/*
Restart alarm for the currently active tab, whenever a new tab becomes active.
*/
browser.tabs.onActivated.addListener((activeInfo) => {
  restartAlarm(activeInfo.tabId);
});

/*
restartAlarm: clear all alarms,
then set a new alarm for the given tab.
*/
function restartAlarm(tabId) {
  browser.alarms.clearAll();
  var gettingTab = browser.tabs.get(tabId);
  gettingTab.then((tab) => {
    browser.alarms.create("", {delayInMinutes: DELAY});
  });
}


/*
On alarm, show the page action.
*/
browser.alarms.onAlarm.addListener((alarm) => {
  var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
  gettingActiveTab.then((tabs) => {
    //browser.pageAction.show(tabs[0].id);
    var tab = tabs[0];
    console.log('alarm hit');
    console.dir(tab);
    if (tab.url){
      //We fire an event or something that will tell background js to register the new window.
      var event = new CustomEvent('pageChange', {'detail':tab.url});
      document.dispatchEvent(event);
    }
  });
});