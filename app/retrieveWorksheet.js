/*
Code for retrieving a single worksheet from IDB
*/
import constants from "./constants.js"
import { useTimeOfLastWorksheetAddStore } from "./components/WorksheetViewer.js"

const useBasePath = process.env.NEXT_PUBLIC_USEBASEPATH === "true" //grab the NEXT_PUBLIC_USEBASEPATH variable that was declared when “pnpm next build” was called
const basePathToUse = "/sam_browser/out" //No trailing slash. Change to Github repo name if using Github pages.

export let worksheets = {}

export async function getWorksheetsWithoutPageBlobs() {
  const filePath = (useBasePath ? basePathToUse : "") + "/worksheetsWithoutPageBlobs.json"; // Path relative to the public folder
  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    Object.assign(worksheets, jsonData);
  } catch (error) {
    console.error("Error fetching worksheetsWithoutPageBlobs.json:", error);
    return null;
  }
}

export function retrieveWorksheet( worksheetID ){
  //Adds the worksheet with ID worksheetID to the global worksheets object
  //by grabbing data such as pageBlobs from IDB
  const idbDatabaseVersion = constants.idbDatabaseVersion
  const request = indexedDB.open("worksheetDatabase", idbDatabaseVersion)
  request.onupgradeneeded = function(event){
    const db = event.target.result
    db.createObjectStore("allWorksheets")
  }
  
  request.onsuccess = async function(event){
    const db = event.target.result
    const transaction = db.transaction("allWorksheets", "readonly")
    const objectStore = transaction.objectStore("allWorksheets")
    const worksheetRequest = objectStore.get(worksheetID)
    worksheetRequest.onsuccess = async function(event){
      const worksheet = event.target.result
      if(worksheet !== undefined){
        //Add the worksheet to the global worksheets object
        worksheets[worksheetID] = worksheet
        useTimeOfLastWorksheetAddStore.setState( { timeOfLastWorksheetAdd: Date.now() } ) //Update this value purely to trigger rerenders
        // console.log("Worksheet added to global worksheets object:", worksheetID)
      }else{
        console.log("Worksheet not found in IDB:", worksheetID)
      }
    }
  }
}