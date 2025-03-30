import { create } from 'zustand'

export const useAWorksheetProcessIsBusyStore = create( (set) => ({
  aWorksheetProcessIsBusy: false,
  updateValue: (newValue) => { 
    set( ()=>{ return { aWorksheetProcessIsBusy: newValue } } )
  }
}))

export const useStatusMessageStore = create( (set)=> ({
  statusMessage: "",
  setStatusMessage: (newValue)=>{ set( ()=>({ statusMessage: newValue }) ) }
}))

export const useUserHasPinchZoomedStore = create( (set) => {
  return {
    userHasPinchZoomed: false,
    setUserHasPinchZoomed: (newValue) => { set( ()=>({ userHasPinchZoomed: newValue}) ) }
  }
})

export const useUserJustClickedMoveStore = create( (set) => ({
  userJustClickedMove: false
}))

export const useAddWorksheetModalIsOpenStore = create( (set)=> ({
  addWorksheetModalIsOpen: false,
  setAddWorksheetModalIsOpen: (newValue)=>{ set( ()=>({ addWorksheetModalIsOpen: newValue }) ) },
  indexOfStudentAddingFor: null, //Index in openStudents in useSessionStateStore
  setIndexOfStudentAddingFor: (newValue)=>{ set( ()=>({ indexOfStudentAddingFor: newValue }) ) }
}))