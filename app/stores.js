import { create } from 'zustand'

export const useAWorksheetProcessIsBusyStore = create( (set) => ({
  aWorksheetProcessIsBusy: false,
  updateValue: (newValue) => { 
    set( ()=>{ return { aWorksheetProcessIsBusy: newValue } } )
  }
}))

export const useStatusMessageStore = create( (set)=> ({
  statusMessage: "Retrieving worksheet data from your device...",
  setStatusMessage: (newValue)=>{ set( ()=>({ statusMessage: newValue }) ) }
}))

export const useUserHasPinchZoomedStore = create( (set) => {
  return {
    userHasPinchZoomed: false,
    setUserHasPinchZoomed: (newValue) => { set( ()=>({ userHasPinchZoomed: newValue}) ) }
  }
})

export const useAddWorksheetModalIsOpenStore = create( (set)=> ({
  addWorksheetModalIsOpen: false,
  setAddWorksheetModalIsOpen: (newValue)=>{ set( ()=>({ addWorksheetModalIsOpen: newValue }) ) }
}))