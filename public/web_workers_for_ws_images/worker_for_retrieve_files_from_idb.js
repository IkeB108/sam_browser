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
    
    let cursor = objectStore.openCursor()
    let newWorksheets = {}
    let worksheetsLoadedCount = 0
    cursor.onsuccess = function(event){
      let cursor = event.target.result
      if(cursor){
        newWorksheets[cursor.key] = cursor.value
        worksheetsLoadedCount ++
        if(worksheetsLoadedCount % 39 == 0){
          useLoadingAnimation = true
          latestStatusMessage = "Retrieving worksheet #" + worksheetsLoadedCount + " from your device..."
          // self.postMessage({
          //   "type": "status_update_from_web_worker",
          //   "content": "Retrieving worksheet #" + worksheetsLoadedCount + " from your device.."
          // })
        }
        cursor.continue()
      } else {
        self.postMessage({
          "type": "worksheets_from_idb",
          "content": newWorksheets
        })
      }
    }
    
    transaction.oncomplete = function(){
      clearInterval(loadingAnimationInterval)
      useLoadingAnimation = false
      self.postMessage({
        "type": "status_update_from_web_worker",
        "content": worksheetsLoadedCount + " worksheets retrieved from your device"
      })
    }
  }
}