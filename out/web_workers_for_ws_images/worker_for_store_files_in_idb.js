self.onmessage = async function(event){
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
      if(worksheetCount % 50 == 0){
        self.postMessage({
          "type": "status_update_from_web_worker",
          "content": "Storing worksheet #" + worksheetCount + " on your device..."
        })
      }
    }
    transaction.oncomplete = function(){
      self.postMessage({
        "type": "status_update_from_web_worker",
        "content": "All worksheets stored: " + worksheetCount + " files"
      })
      self.postMessage({
        "type": "confirm_transaction_complete",
        "content": "Transaction complete"
      })
    }
  }
}