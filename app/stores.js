import { create } from 'zustand'

let useAWorksheetProcessIsBusyStore = create( (set) => ({
  aWorksheetProcessIsBusy: false,
  updateValue: (newValue) => { 
    set( ()=>{ console.log("worksheet process is busy set to " + newValue); return { aWorksheetProcessIsBusy: newValue } } )
  }
}))

const useStatusMessageStore = create( (set)=> ({
  statusMessage: "Retrieving worksheet data from your device...",
  setStatusMessage: (newValue)=>{ set( ()=>({ statusMessage: newValue }) ) }
}))

export { useStatusMessageStore, useAWorksheetProcessIsBusyStore }