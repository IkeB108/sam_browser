'use client'
//     ikeb108.github.io/sam_browser/out
import React, { useEffect } from 'react'
import { create } from 'zustand'
import WorksheetViewer from './components/WorksheetViewer.js'
import SettingsPage from './components/SettingsPage.js'
import { retrieveWorksheetsFromIndexedDB, setStatusMessageOfWorksheetProcess } from "./components/SettingsPage.js"
import { useUserHasPinchZoomedStore, useUserJustClickedMoveStore } from "./stores.js"
import constants from "./constants.js"

//Keys in allPages use PascalCasing to match the react component names
const allPages = {
  "WorksheetViewer": <WorksheetViewer />,
  "SettingsPage": <SettingsPage />
}

/*
create() is a method from the zustand module for emulating global variables.
(Simpler alternative to useContext, useState, and redux).

create() returns a "store hook"--a function which, when called, returns a "store".
The "store" is a state container, an object which can have any properties you want.
These properties could store data or could be updater functions (called "actions"), 
which can change as many or as few data properties as we want.

create() accepts a function (a "store initializer"). The store initializer return an object
which has all the properties and actions we want our store to have.

"Store hooks" should be declared with const in the global scope.
They can be attached to the "window" object to make them accessible in the browser console.
"Store hooks" can only be *called* inside a React component (React hooks are meant to trigger a component re-render).
To access the store outside a component, call myStoreHook.getState(). From there, you can read
the store's properties and call the store's actions.

*/
const createAllStudentsStore = function(set){ //Store initializer
  /*Zustand passes a "set" function into here. We call "set"
  to update any properties in the store. When we call "set", we pass "set"
  a function which returns a "partial state", an object containing any of the properties of the store
  we want to change.
  We can optionally make that function take the previous state as a parameter.
  */
  const getAllStudentsFromLocalStorage = function(){
    /*This function defines the logic for the initAllStudents action (see below).
    This function doesn't require the previous state as a parameter.
    This function returns a "partial state" which updates the "allStudents" property of the store.
    */
    let allStudentsInLocalStorage = localStorage.getItem("allStudents")
    if(allStudentsInLocalStorage !== null){
      //console.log("Found allStudents in local storage.")
      return { allStudents: JSON.parse(allStudentsInLocalStorage) }
    } else {
      //console.log("Didn't find allStudents in local storage.")
      return { allStudents: {} }
    }
  }
  
  const setAllStudentsToValue = function( newValue ){
    return { allStudents: newValue }
  }
  
  return {
    allStudents: {},
    initAllStudents: ()=> { set(getAllStudentsFromLocalStorage) }, //Action
    /*
    The initAllStudents() action is called in HomePage(), when the HomePage component
    is mounted for the first time. To do this, we use HomePage's useEffect() hook, pass in a function
    that calls initAllStudents(), and also pass in an empty dependency array [], which tells React to only
    run that function once when the component is mounted.
    */
   setAllStudents: (newValue) => { set( setAllStudentsToValue(newValue) ) },
  }
}

const useAllStudentsStore = create(createAllStudentsStore) //Returns a store hook

//Filler data for debugging
// const fillerStudentData = {
//   "1": { //id number for the student (to avoid glitches w same-name students)
//     "name": "Student 1",
//     "color": "pink"
//   },
//   "2": {
//     "name": "Student 2",
//     "color": "purple"
//   },
//   "3": {
//     "name": "Student 3",
//     "color": "blue"
//   }
// }


const fillerStudentData = {}
if(true){
  let colorCycle = "red orange yellow green cyan blue purple pink".split(" ")
  for(let i = 1; i < 100; i ++){
    fillerStudentData[i] = {
      "name": "Student " + i,
      "color": colorCycle[ (i-1) % colorCycle.length]
    }
  }
}
useAllStudentsStore.getState().setAllStudents(fillerStudentData)

const useSessionStateStore = create( (set)=> ({
  // openStudents: {
  //   "2": {
  //     "openWorksheets": [],
  //     "positionInWorksheetSelectionPanel": 0
  //   },
  //   "1": {
  //     "openWorksheets": [],
  //     "positionInWorksheetSelectionPanel": 1
  //   }
  // },
  // highestPositionInWorksheetSelectionPanel: 1,
  // deleteOpenStudent: (studentIDNumber)=>{
  //   let newOpenStudents = {...useSessionStateStore.getState().openStudents}
  //   delete newOpenStudents[studentIDNumber]
  //   set( ()=>({ openStudents: newOpenStudents }) )
  // },
  // addOpenStudentToBottom: (studentIDNumber)=>{
  //   let newOpenStudents = {...useSessionStateStore.getState().openStudents}
  //   let highestPositionInWorksheetSelectionPanel = useSessionStateStore.getState().highestPositionInWorksheetSelectionPanel
  //   let newOpenStudent = {
  //     "openWorksheets": [],
  //     "positionInWorksheetSelectionPanel": highestPositionInWorksheetSelectionPanel + 1
  //   }
  //   newOpenStudents[studentIDNumber] = newOpenStudent
  //   set( ()=>({ openStudents: newOpenStudents }) )
  //   set( () => ({ highestPositionInWorksheetSelectionPanel: highestPositionInWorksheetSelectionPanel + 1 }) )
  // }
  // openStudents: [
  //   {"openWorksheets": [], "studentIDNumber": "1"},
  //   {"openWorksheets": [], "studentIDNumber": "2"},
  //   {"openWorksheets": [], "studentIDNumber": "3"},
  //   {"openWorksheets": [], "studentIDNumber": "other"}
  // ],
  
  openStudents: [ {"openWorksheets": [], "studentIDNumber": "other"} ],
  setOpenStudents: (newValue)=>{
    set( ()=>({ openStudents: newValue }) );
    useSessionStateStore.getState().saveToLocalStorage()
  },
  deleteOpenStudent: (studentIDNumber)=>{
    /*
    When deleting a student, we need to update the openStudentIndex of the currentWorksheet
    because the openStudents array will be shorter after the student is deleted.
    To do this, we'll grab the student ID number of the student at openStudentIndex
    and then use the student ID number to reset the openStudentIndex after deleting this student.
    This works because there will never be two StudentSessionCards with the same student ID number.
    */
    
    //Get the id number of the student at openStudentIndex
    const { currentWorksheet, openStudents } = useSessionStateStore.getState()
    let studentIDNumberOfOpenStudent = null //Set to null if no worksheet is open
    if(currentWorksheet.openStudentIndex !== null){
      studentIDNumberOfOpenStudent = openStudents[currentWorksheet.openStudentIndex].studentIDNumber
    }
    
    //Delete the student
    let newOpenStudents = useSessionStateStore.getState().openStudents.filter( (student)=> student.studentIDNumber !== studentIDNumber )
    set( ()=>({ openStudents: newOpenStudents }) )
    
    if(studentIDNumberOfOpenStudent == null)return; //If no worksheet was open, don't do anything else
    
    //Use the id number to redefine the openStudentIndex
    const newOpenStudentIndex = newOpenStudents.findIndex( (student)=> student.studentIDNumber === studentIDNumberOfOpenStudent )
    //If newOpenStudentIndex is -1, that means that we just deleted the student at openStudentIndex
    //So we need to set openStudentIndex to null
    if(newOpenStudentIndex === -1){
      set( ()=>({ currentWorksheet: { openStudentIndex: null, worksheetIndex: null } }) )
    } else {
      set( ()=>({ currentWorksheet: { openStudentIndex: newOpenStudentIndex, worksheetIndex: currentWorksheet.worksheetIndex } }) )
    }
    
    useSessionStateStore.getState().saveToLocalStorage()
  },
  addOpenStudentToBottom: (studentIDNumber)=>{
    // let newOpenStudents = useSessionStateStore.getState().openStudents.concat()
    const newStudentData = {"openWorksheets": [], "studentIDNumber": studentIDNumber}
    //Add newStudentData as second to last student in openStudents
    let newOpenStudents = [...useSessionStateStore.getState().openStudents];
    newOpenStudents.splice(newOpenStudents.length - 1, 0, newStudentData);
    set( ()=>({ openStudents: newOpenStudents }) )
    
    useSessionStateStore.getState().saveToLocalStorage()
  },
  idOfLastStudentAdded: "0",
  
  currentPage: "WorksheetViewer",
  setCurrentPage: (newValue)=>{
    set( ()=>({ currentPage: newValue }) )
    useSessionStateStore.getState().saveToLocalStorage()
  },
  currentWorksheet: { openStudentIndex: null, worksheetIndex: null },
  setCurrentWorksheet: (openStudentIndex, worksheetIndex)=>{
    set( ()=>({ currentWorksheet: { openStudentIndex: openStudentIndex, worksheetIndex: worksheetIndex } }) )
    useSessionStateStore.getState().saveToLocalStorage()
  },
  getCurrentWorksheetID: ()=>{
    const { openStudents, currentWorksheet } = useSessionStateStore.getState()
    if(currentWorksheet.openStudentIndex === null || currentWorksheet.worksheetIndex === null) return null
    return openStudents[currentWorksheet.openStudentIndex].openWorksheets[currentWorksheet.worksheetIndex].id
  },
  userIsMovingCurrentWorksheet: false,
  setUserIsMovingCurrentWorksheet: (newValue)=>{
    set( ()=>({ userIsMovingCurrentWorksheet: newValue }) )
  },
  userCanClickAnywhereToDisableMovingCurrentWorksheet: false,
  setUserCanClickAnywhereToDisableMovingCurrentWorksheet: (newValue)=>{ set( ()=>({ userCanClickAnywhereToDisableMovingCurrentWorksheet: newValue }) ) },
  currentPageOfWorksheet: 0, //Value of the page on the left
  setCurrentPageOfWorksheet: (newValue)=>{ 
    set( ()=>({ currentPageOfWorksheet: newValue }) )
    const { openStudents, currentWorksheet } = useSessionStateStore.getState()
    if (currentWorksheet.openStudentIndex !== null && currentWorksheet.worksheetIndex !== null) {
      openStudents[currentWorksheet.openStudentIndex].openWorksheets[currentWorksheet.worksheetIndex].pageLeftOff = newValue
      set({ openStudents: [...openStudents] })
    }
    
    useSessionStateStore.getState().saveToLocalStorage()
  },
  allowArrowKeysForPageNavigation: true,
  setAllowArrowKeysForPageNavigation: (newValue)=>{ set( ()=>({ allowArrowKeysForPageNavigation: newValue }) ) },
  
  saveToLocalStorage: () => {
    const sessionState = useSessionStateStore.getState()
    //Store only the following values in local storage
    const partialSessionState = {
      openStudents: sessionState.openStudents,
      idOfLastStudentAdded: sessionState.idOfLastStudentAdded,
      currentPage: sessionState.currentPage,
      currentWorksheet: sessionState.currentWorksheet,
      currentPageOfWorksheet: sessionState.currentPageOfWorksheet
    }
    localStorage.setItem("sessionState", JSON.stringify(partialSessionState))
  },
  
  loadFromLocalStorage: () => {
    const sessionStateFromLocalStorage = localStorage.getItem("sessionState")
    if(sessionStateFromLocalStorage !== null){
      console.log("loading sessionstate from local storage")
      const partialSessionState = JSON.parse(sessionStateFromLocalStorage)
      for(let i in partialSessionState.openStudents){
        partialSessionState.openStudents[i].studentIDNumber = (Number(i) + 1).toString()
        if(i == partialSessionState.openStudents.length - 1){
          partialSessionState.openStudents[i].studentIDNumber = "other"
        }
      }
      set( ()=>({
        openStudents: partialSessionState.openStudents,
        idOfLastStudentAdded: partialSessionState.idOfLastStudentAdded,
        currentPage: partialSessionState.currentPage,
        currentWorksheet: partialSessionState.currentWorksheet,
        currentPageOfWorksheet: partialSessionState.currentPageOfWorksheet
      }) )
    }
  }
}))

const useUserSettingsStore = create( (set)=> ({
  //settings go here
  pageView: "double", //single or double
  setPageView: (newValue)=>{ set( ()=>({ pageView: newValue }) ) },
  madisonMode: false,
  setMadisonMode: (newValue)=>{ set( ()=>({ madisonMode: newValue }) ) }
}))

export function calcUserHasPinchZoomed(){
  //calculates whether the user has pinch zoomed on the page
  return window.visualViewport.scale !== 1
}

function updateUserHasPinchZoomedOnResize(){
  //If the user has pinch zoomed, set the store to true,
  //but only if it's not already set to true. Otherwise, setting it to true
  //would cause unnecessary rerenders of the entire HomePage during every frame of pinch zoom gesture.
  if( calcUserHasPinchZoomed() ){
    if(!useUserHasPinchZoomedStore.getState().userHasPinchZoomed){
      useUserHasPinchZoomedStore.getState().setUserHasPinchZoomed(true)
    }
  }
  //If the user has not pinch zoomed, the userHasPinchZoomed state shouldn't be set to false until touchend.
  //Otherwise, the user could trigger drag events while pinch zooming if it's zoomed all the way out.
}

const worksheets = {}

function HomePage() {
  const { userHasPinchZoomed } = useUserHasPinchZoomedStore()
  const { pageView } = useUserSettingsStore()
  //The function in this useEffect will run every time HomePage is rerendered,
  //which will happen every time userHasPinchZoomed changes, which should be
  //at the start and end of pinch zoom gestures, but not in between.
  useEffect( ()=>{
    //These event listeners get added every time the component is rerendered.
    //To prevent event listeners from accumulating, they get removed when the component unmounts
    //via the cleanup function that is returned below.
    window.visualViewport.addEventListener("resize", updateUserHasPinchZoomedOnResize)
    document.addEventListener("touchend", onDocumentTouchEndOrMouseUp)
    document.addEventListener("mouseup", onDocumentTouchEndOrMouseUp)
    updateUserHasPinchZoomedOnResize()
    
    if(window.location.href.includes("?eruda=true")){
      /*
      Eruda is a module for adding virtual devtools to a webpage for mobile debugging.
      Eruda expects to be run in-browser, so it needs to be imported dynamically
      from within a component like HomePage with useEffect. It's not enough to
      just import it at the top of a file that says 'use client'.
      The reason that we're importing this differently from how Eruda recommends
      in docs is because Eruda doesn't necessarily expect to be used in a
      React/Nextjs app.
      
      For Android, we can use chrome://inspect/#devices to do remote debugging for
      Chrome, but not for other browsers.
      https://developer.chrome.com/docs/devtools/remote-debugging
      
      However, the port-forwarding feature of chrome://inspect/#devices can be
      used on any web browser on the Android device, which allows us to run the
      webpage from "npm run dev" instead of having to build first.
      
      ^ It seems like this often requires opening the page in Chrome first before
      then opening the page in the other browser for some reason.
      */
      import("eruda").then ( (module) => { module.default.init() })
    }
    
    // window.eruda = eruda
    return ()=> {
      window.visualViewport.removeEventListener("resize", updateUserHasPinchZoomedOnResize)
      document.removeEventListener("touchend", onDocumentTouchEndOrMouseUp)
      document.removeEventListener("mouseup", onDocumentTouchEndOrMouseUp)
    }
  }, [])
  
  const homePageStyle = {
    fontFamily: "Roboto, sans-serif",
    fontWeight: "normal",
    fontSize: "18px",
    height: "100%",
    width: "100%",
    maxWidth: (pageView == "double") ? "1500px" : "1000px",
    color: constants.nearBlackColor,
    // touchAction: userHasPinchZoomed ? "auto" : "pinch-zoom", 
    margin: "0 auto"
  }
  
  // const sessionStateStore = useSessionStateStore()
  const currentPage = useSessionStateStore( (state)=> state.currentPage )
  
  if(currentPage == "WorksheetViewer"){
    homePageStyle.touchAction = (userHasPinchZoomed) ? "auto" : "pinch-zoom" //If the user has pinch zoomed, allow panning. If not, disable panning
  }
  /*
  When HomePage mounts for the first time, initialize allStudentsStore by grabbing
  allStudents from localStorage. Pass an empty dependency array [] into useEffect to tell React
  to only run this code the first time HomePage mounts.
  */
  useEffect( ()=>{
    //useAllStudentsStore.getState().initAllStudents();
    window.useAllStudentsStore = useAllStudentsStore; //call useAllStudentsStore.getState() when accessing in the dev console.
    window.useSessionStateStore = useSessionStateStore;
    window.useUserSettingsStore = useUserSettingsStore;
    
    //On page load, retrieve worksheets from IndexedDB if any. This function is imported from SettingsPage.js
    retrieveWorksheetsFromIndexedDB()
  }, [])
  /*
  The dependency array we pass into useEffect tells React which variables to look
  for changes in. When any of these variables change, the function in useEffect() is
  triggered. Empty = run only once (on component mount).
  */
  const onClick = function(){
    if(currentPage == "WorksheetViewer"){
      const { userIsMovingCurrentWorksheet, userCanClickAnywhereToDisableMovingCurrentWorksheet } = useSessionStateStore.getState()
      const { userJustClickedMove } = useUserJustClickedMoveStore.getState()
      if(!userJustClickedMove && userIsMovingCurrentWorksheet && userCanClickAnywhereToDisableMovingCurrentWorksheet){
        const { setUserIsMovingCurrentWorksheet, setUserCanClickAnywhereToDisableMovingCurrentWorksheet } = useSessionStateStore.getState()
        setUserIsMovingCurrentWorksheet(false)
        setUserCanClickAnywhereToDisableMovingCurrentWorksheet(false)
      }
      // if(sessionStateStore.userIsMovingCurrentWorksheet && sessionStateStore.userCanClickAnywhereToDisableMovingCurrentWorksheet){
      //   console.log("set to false")
      //   sessionStateStore.setUserIsMovingCurrentWorksheet(false)
      //   sessionStateStore.setUserCanClickAnywhereToDisableMovingCurrentWorksheet(false)
      // }
    }
  }
  return (
    <div style={homePageStyle} onClick={onClick}>
      {allPages[currentPage]}
    </div>
  )
}

const onDocumentTouchEndOrMouseUp = function(){
  updateUserHasPinchZoomedIfChanged(false)
}

function updateUserHasPinchZoomedIfChanged( callAgainBoolean ){
  //Update userhaspinchzoomed store, but only if the value has changed.
  //(to prevent unnecessary rerenders)
  const newUserHasPinchZoomed = calcUserHasPinchZoomed()
  const oldUserHasPinchZoomed = useUserHasPinchZoomedStore.getState().userHasPinchZoomed
  if(oldUserHasPinchZoomed !== newUserHasPinchZoomed){
    useUserHasPinchZoomedStore.getState().setUserHasPinchZoomed(newUserHasPinchZoomed)
  }
  if(callAgainBoolean) setTimeout( updateUserHasPinchZoomedIfChanged(false), 1000 )
}

export { useAllStudentsStore, useSessionStateStore, useUserSettingsStore, worksheets }
export default HomePage
