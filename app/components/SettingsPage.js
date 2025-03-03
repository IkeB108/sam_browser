import constants from '../constants'
import React, { useRef, useState, useEffect } from "react"
import { create } from 'zustand'
import { useUserSettingsStore, worksheets, worksheetImages } from '../page.js'
let lastUploadedWorksheetTarFile = null
let allUntarredFiles = {}
let useUserIsUploadingWorksheetImagesStore = create( (set) => ({
  userIsUploadingWorksheetImages: false,
  updateValue: (newValue) => { 
    set( ()=>{ console.log("uploading value set to " + newValue); return { userIsUploadingWorksheetImages: newValue } } )
  }
}))

const useStatusMessageStore = create( (set)=> ({
  statusMessage: "Waiting for file input.",
  setStatusMessage: (newValue)=>{ set( ()=>({ statusMessage: newValue }) ) }
}))

function setStatusMessage(newValue){
  useStatusMessageStore.getState().setStatusMessage(newValue)
}

function SettingsPage(){
  const settingsPageStyle = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: constants.pagePadding
  }
  
  return (
    <div style={settingsPageStyle}>
      <h1>Settings</h1>
      { constants.CloseButton(constants.pagePadding, ()=>{ useSessionStateStore.getState().setCurrentPage("WorksheetViewer") }) }
      <UploadWorksheetImageDataButton />
      <br />
      <RetrieveWorksheetImageDataButton />
      <br /><br />
      <ClearWorksheetImageDataButton />
      <br /><br />
      <button onClick={()=>{ statusMessageStore.setStatusMessage(typeof untar) }}>Test Untar</button>
      <StatusParagraph />
      
    </div>
  )
}

function UploadWorksheetImageDataButton(){
  const UploadWorksheetImageDataButtonStyle = constants.getGenericButtonStyle("primary")
  const fileInputRef = React.useRef(null)
  const WorksheetImageDataButtonOnClick = () => {
    fileInputRef.current.click()
  }
  const onFileInputChange = async function(e){
    if(e.target.files.length === 0){
      return
    }
    const selectedFile = e.target.files[0]
    lastUploadedWorksheetTarFile = selectedFile
    allUntarredFiles = await getUntarredFiles(selectedFile)
    updateWorksheetsObjectWithUntarredFiles(allUntarredFiles)
    storeWorksheetsInIndexedDB()
  }
  
  return (
    <div>
      <button style={UploadWorksheetImageDataButtonStyle} onClick={WorksheetImageDataButtonOnClick}>Upload Worksheet Image Data</button>
      <input type="file" style={{display: "none"}} ref={fileInputRef} accept=".tar" onChange={onFileInputChange}/>
    </div>
  )
}

async function getUntarredFiles(tarFile){
  setStatusMessage("Extracting images from tar file...")
  
  const reader = new FileReader()
  let allExtractedFiles = {}
  let extractedFilesCount = 0
  
  return new Promise((resolve, reject) => {
    reader.onload = function(event){
      untar(reader.result).then(
        function(extractedFiles){
          for(let i in extractedFiles){
            //Get file name (with any folder paths removed)
            const fileName = extractedFiles[i].name.substring(extractedFiles[i].name.lastIndexOf('/') + 1)
            if(fileName.includes(".webp")){
              let oldBlob = extractedFiles[i].blob
              let newBlob = new Blob([oldBlob], {type: "image/webp"})
              let newExtractedFile = {
                "name": fileName,
                "blob": newBlob,
                "size": extractedFiles[i].size
              }
              allExtractedFiles[fileName] = newExtractedFile
              extractedFilesCount ++
            } else {
              console.log("File not a webp image: " + fileName)
            }
          }
          setStatusMessage(extractedFilesCount + " images extracted.")
          resolve(allExtractedFiles)
        }
      ).catch(reject);
    }
    reader.onerror = reject;
    reader.readAsArrayBuffer(tarFile)
  })
}

function updateWorksheetsObjectWithUntarredFiles(untarredFiles){
  for(let fileName in untarredFiles){
    const worksheetID = fileName.split("_-")[0]
    const pageNumber = Number(fileName.split("_-")[1].split(".")[0])
    if(worksheets[worksheetID]){
      worksheets[worksheetID].pageBlobs[pageNumber] = untarredFiles[fileName].blob
    } else {
      const pageBlobs = {}
      pageBlobs[pageNumber] = untarredFiles[fileName].blob
      worksheets[worksheetID] = {
        pageBlobs,
        is_old: fileName.includes("(OLD)"),
        localization: fileName.includes("(USA)") ? "USA" : "only",
        //localization property will be "only" if there is only one version of the worksheet, rather than a USA and non-USA version
        //localization property will be "USA" if it's the usa version and "NON-USA" if it's not the USA version, but a USA version does exist
        pageCount: "unknown"
      }
    }
  }
  updateLocalizationPropertyOfAllWorksheets()
  // window.worksheets = worksheets
}

function updateLocalizationPropertyOfAllWorksheets(){
  //Now that all worksheets are created, any worksheets where localization
  //property is set to "only" need to be changed to "NON-USA" if a USA version exists
  const usaVersionExists = function(worksheetIDToMatch){
    const worksheetIDToMatchNumbersOnly = worksheetIDToMatch.replace(/\D/g, "")
    for(let worksheetID in worksheets){
      const worksheetIDNumbersOnly = worksheetID.replace(/\D/g, "")
      if(worksheetID.includes("(USA)") && worksheetIDNumbersOnly == worksheetIDToMatchNumbersOnly){
        return true
      }
    }
    return false
  }
  for(let worksheetID in worksheets){
    if(worksheets[worksheetID].localization == "only"){
      if(usaVersionExists(worksheetID)){
        worksheets[worksheetID].localization = "NON-USA"
      }
    }
    //While we're here, also update pageCount property
    worksheets[worksheetID].pageCount = Object.keys(worksheets[worksheetID].pageBlobs).length
  }
}

function storeWorksheetsInIndexedDB(){
  const workerForStoreWorksheetsInIDB = new Worker(constants.webWorkersFolderPath + "/worker_for_store_files_in_idb.js")
  const dataToSend = {
    worksheets,
    idbDatabaseVersion: constants.idbDatabaseVersion
  }
  workerForStoreWorksheetsInIDB.postMessage(dataToSend)
  workerForStoreWorksheetsInIDB.onmessage = function(event){
    if(event.data.type == "status_update_from_web_worker"){
      setStatusMessage(event.data.content)
    }
    if(event.data.type == "confirm_transaction_complete"){
      useUserIsUploadingWorksheetImagesStore.getState().updateValue(false)
    }
  }
  useUserIsUploadingWorksheetImagesStore.getState().updateValue(true)
}

function RetrieveWorksheetImageDataButton(){
  const RetrieveWorksheetImageDataButtonStyle = constants.getGenericButtonStyle("primary")
  const userIsUploadingWorksheetImages = useUserIsUploadingWorksheetImagesStore().userIsUploadingWorksheetImages
  const onClick = function(){
    if(!userIsUploadingWorksheetImages){
      retrieveWorksheetsFromIndexedDB()
    }
  }
  return (
    <button 
      style={RetrieveWorksheetImageDataButtonStyle} 
      onClick={onClick} 
      disabled={userIsUploadingWorksheetImages}
      className={"button-with-disabled-variant"}
    >
      Retrieve Worksheet Image Data
    </button>
  )
}

function retrieveWorksheetsFromIndexedDB(){
  const workerForRetrieveWorksheetsInIDB = new Worker(constants.webWorkersFolderPath + "/worker_for_retrieve_files_from_idb.js")
  // const workerForRetrieveWorksheetsInIDB = new Worker(constants.webWorkersFolderPath + "/lskdjflskdjf.js")
  const dataToSend = {
    idbDatabaseVersion: constants.idbDatabaseVersion
  }
  workerForRetrieveWorksheetsInIDB.postMessage(dataToSend)
  workerForRetrieveWorksheetsInIDB.onmessage = function(event){
    if(event.data.type == "status_update_from_web_worker"){
      setStatusMessage(event.data.content)
    }
    if(event.data.type == "worksheets_from_idb"){
      //our worksheets object needs to have all and only the properties
      //from event.data.content.
      //Start by clearing all pre-existing properties of worksheets,
      //then use Object.assign() to copy all properties from event.data.content
      //to worksheets.
      for(let worksheetID in worksheets){
        if(worksheets.hasOwnProperty(worksheetID)){
          delete worksheets[worksheetID]
        }
      }
      Object.assign(worksheets, event.data.content)
      window.worksheets = worksheets
    }
  }
}

function ClearWorksheetImageDataButton(){
  const ClearWorksheetImageDataButtonStyle = constants.getGenericButtonStyle("primary")
  const userIsUploadingWorksheetImages = useUserIsUploadingWorksheetImagesStore().userIsUploadingWorksheetImages
  const onClick = function(){
    if(!userIsUploadingWorksheetImages){
      clearWorksheetsInIndexedDB()
    }
  }
  return (
    <button 
      style={ClearWorksheetImageDataButtonStyle} 
      onClick={onClick} 
      disabled={userIsUploadingWorksheetImages}
      className={"button-with-disabled-variant"}
    >
      Clear Worksheet Image Data
    </button>
  )
}

function clearWorksheetsInIndexedDB(){
  let request = indexedDB.open("worksheetDatabase", constants.idbDatabaseVersion) 
  request.onupgradeneeded = function(event){
    let db = event.target.result
    db.createObjectStore("allWorksheets")
  }
  request.onsuccess = async function(event){
    let db = event.target.result
    let transaction = db.transaction("allWorksheets", "readwrite")
    let objectStore = transaction.objectStore("allWorksheets")
    objectStore.clear()
  }
}

function StatusParagraph(){
  const statusMessage = useStatusMessageStore().statusMessage
  return (
    <p style={{whiteSpace: "pre-wrap"}}>{statusMessage}</p>
  )
}

// For testing
// function ImageDisplay(){
//   const [indexOfImage, updateIndexOfImage] = useState(0)
//   const [fileURL, updateFileURL] = useState(null)
  
//   const onImageDisplayClick = function(){
//     const fileNamesArray = Object.keys(allUntarredFiles)
//     if(indexOfImage < Object.keys(allUntarredFiles).length - 1){
//       updateIndexOfImage(indexOfImage + 1)
//     } else {
//       updateIndexOfImage(0)
//     }
//     let newImageBlob = allUntarredFiles[fileNamesArray[indexOfImage]].blob
//     let newFileURL = URL.createObjectURL(newImageBlob)
//     updateFileURL(newFileURL)
//   }
  
//   const imgStyle = {
//     width: "100px",
//     height: "100px",
//     border: "1px solid black"
//   }
//   return (
//     <img src={fileURL} onClick={onImageDisplayClick} style={imgStyle}/>
//   )
// }

export default SettingsPage