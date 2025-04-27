let loadingAnimationIconCount = 0
let latestStatusMessage = null
let useLoadingAnimation = false
self.onmessage = async function(event){
  let loadingAnimationInterval = setInterval( ()=> {
    if(useLoadingAnimation){
      loadingAnimationIconCount = (loadingAnimationIconCount + 1) % 9
      self.postMessage({
        type: "status_update_from_web_worker",
        content: latestStatusMessage + " " + "*".repeat(loadingAnimationIconCount)
      })
    }
  }, 200)
  let worksheets = event.data.worksheets
  let idbDatabaseVersion = event.data.idbDatabaseVersion
  
  let request = indexedDB.open("worksheetDatabase", idbDatabaseVersion) 
  request.onupgradeneeded = function(event){
    let db = event.target.result
    db.createObjectStore("allWorksheets")
  }
  request.onsuccess = async function(event){
    let db = event.target.result
    let transaction = db.transaction("allWorksheets", "readwrite")
    let objectStore = transaction.objectStore("allWorksheets")
    let worksheetCount = 0
    for(let worksheetID in worksheets){
      objectStore.put(worksheets[worksheetID], worksheetID)
      worksheetCount ++
      if(worksheetCount % 39 == 0){
        useLoadingAnimation = true
        latestStatusMessage = "Storing worksheets in your browser's cache. This may take a minute..."
        // self.postMessage({
        //   "type": "status_update_from_web_worker",
        //   "content": "Storing worksheet #" + worksheetCount + " on your device..."
        // K
      }
    }
    transaction.oncomplete = function(){
      clearInterval(loadingAnimationInterval)
      useLoadingAnimation = false
      self.postMessage({
        "type": "status_update_from_web_worker",
        "content": "All worksheets stored."
      })
      self.postMessage({
        "type": "confirm_transaction_complete",
        "content": "Transaction complete"
      })
    }
  }
}