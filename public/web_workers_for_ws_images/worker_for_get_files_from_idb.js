self.onmessage = async function(event){
  let fileDatabaseVersion = event.data.fileDatabaseVersion
  
  let request = indexedDB.open("fileDatabase", fileDatabaseVersion) 
  request.onupgradeneeded = function(event){
    let db = event.target.result
    db.createObjectStore("allFiles")
  }
  
  request.onsuccess = async function(event){
    let db = event.target.result
    let transaction = db.transaction("allFiles", "readwrite")
    let objectStore = transaction.objectStore("allFiles")
    
    let cursor = objectStore.openCursor()
    let files = []
    let filesLoadedCount = 0
    cursor.onsuccess = function(event){
      let cursor = event.target.result
      if(cursor){
        files.push({
          "name": cursor.key,
          "blob": cursor.value
        })
        filesLoadedCount ++
        if(filesLoadedCount % 200 == 0){
          self.postMessage({
            "type": "status_update_from_web_worker",
            "content": "Retrieved " + filesLoadedCount + " files"
          })
        }
        cursor.continue()
      } else {
        self.postMessage({
          "type": "files_from_idb",
          "content": files
        })
      }
    }
    
    transaction.oncomplete = function(){
      self.postMessage({
        "type": "status_update_from_web_worker",
        "content": "All files retrieved: " + files.length + " files"
      })
    }
  }
}