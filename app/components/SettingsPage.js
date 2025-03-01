import constants from '../constants'
import React, { useRef, useState, useEffect } from "react"
import { create } from 'zustand'
import { useUserSettingsAndWorksheetImagesStore, worksheets, worksheetImages, worksheetImagesLoadedFromFileInput } from '../page.js'
let lastUploadedWorksheetTarFile = null
let allUntarredFiles = {}

const useStatusMessageStore = create( (set)=> ({
  statusMessage: "Waiting for file input.",
  setStatusMessage: (newValue)=>{ set( ()=>({ statusMessage: newValue }) ) }
}))

function SettingsPage(){
  const statusMessageStore = useStatusMessageStore()
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
      <button onClick={()=>{ statusMessageStore.setStatusMessage(typeof untar) }}>Test Untar</button>
      <StatusParagraph statusMessage={statusMessageStore.statusMessage} />
      <br /><br />
      <ImageDisplay />
    </div>
  )
}

function UploadWorksheetImageDataButton(){
  const UploadWorksheetImageDataButtonStyle = constants.getGenericButtonStyle("primary")
  const fileInputRef = React.useRef(null)
  const WorksheetImageDataButtonOnClick = () => {
    fileInputRef.current.click()
  }
  const onFileInputChange = function(e){
    const selectedFile = e.target.files[0]
    lastUploadedWorksheetTarFile = selectedFile
    allUntarredFiles = getUntarredFiles(selectedFile)
  }
  
  return (
    <div>
      <button style={UploadWorksheetImageDataButtonStyle} onClick={WorksheetImageDataButtonOnClick}>Upload Worksheet Image Data</button>
      <input type="file" style={{display: "none"}} ref={fileInputRef} accept=".tar" onChange={onFileInputChange}/>
    </div>
  )
}

function getUntarredFiles(tarFile){
  useStatusMessageStore.getState().setStatusMessage("Extracting images from tar file...")
  
  const reader = new FileReader()
  let allExtractedFiles = {}
  let extractedFilesCount = 0
  reader.onload = function(event){
    untar(reader.result).then(
      function(extractedFiles){
        for(let i in extractedFiles){
          let oldBlob = extractedFiles[i].blob
          let newBlob = new Blob([oldBlob], {type: "image/webp"})
          let newExtractedFile = {
            "name": extractedFiles[i].name,
            "blob": newBlob,
            "size": extractedFiles[i].size
          }
          allExtractedFiles[extractedFiles[i].name] = newExtractedFile
          extractedFilesCount ++
        }
        window.allUntarredFiles = allExtractedFiles
        useStatusMessageStore.getState().setStatusMessage(extractedFilesCount + " images extracted.")
        //Next steps: display images to confirm they're loaded. Then test
      }
    )
  }
  reader.readAsArrayBuffer(tarFile)
  return allExtractedFiles
}

function RetrieveWorksheetImageDataButton(){
  const RetrieveWorksheetImageDataButtonStyle = constants.getGenericButtonStyle("primary")
  const RetrieveWorksheetImageDataButtonOnClick = () => {
    console.log("RetrieveWorksheetImageDataButtonOnClick")
  }
  return (
    <button style={RetrieveWorksheetImageDataButtonStyle} onClick={RetrieveWorksheetImageDataButtonOnClick}>Retrieve Worksheet Image Data</button>
  )
}

function StatusParagraph({ statusMessage }){
  return (
    <p style={{whiteSpace: "pre-wrap"}}>{statusMessage}</p>
  )
}

function ImageDisplay(){
  const [indexOfImage, updateIndexOfImage] = useState(0)
  const [fileURL, updateFileURL] = useState(null)
  
  const onImageDisplayClick = function(){
    const fileNamesArray = Object.keys(allUntarredFiles)
    if(indexOfImage < Object.keys(allUntarredFiles).length - 1){
      updateIndexOfImage(indexOfImage + 1)
    } else {
      updateIndexOfImage(0)
    }
    let newImageBlob = allUntarredFiles[fileNamesArray[indexOfImage]].blob
    let newFileURL = URL.createObjectURL(newImageBlob)
    updateFileURL(newFileURL)
  }
  
  const imgStyle = {
    width: "100px",
    height: "100px",
    border: "1px solid black"
  }
  return (
    <img src={fileURL} onClick={onImageDisplayClick} style={imgStyle}/>
  )
}

export default SettingsPage