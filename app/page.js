'use client'
//     ikeb108.github.io/sam_browser/out
import React, { useEffect } from 'react'
import { create } from 'zustand'
import WorksheetViewer from './components/WorksheetViewer.js'
import SettingsPage from './components/SettingsPage.js'
import { retrieveWorksheetsFromIndexedDB, setStatusMessageOfWorksheetProcess } from "./components/SettingsPage.js"
import { useUserHasPinchZoomedStore } from "./stores.js"

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
      console.log("Found allStudents in local storage.")
      return { allStudents: JSON.parse(allStudentsInLocalStorage) }
    } else {
      console.log("Didn't find allStudents in local storage.")
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
   setAllStudents: (newValue) => { set( setAllStudentsToValue(newValue) ) }
  }
}

const useAllStudentsStore = create(createAllStudentsStore) //Returns a store hook

//Filler data for debugging
const fillerStudentData = {
  "1": { //id number for the student (to avoid glitches w same-name students)
    "name": "Bill",
    "color": "red"
  },
  "2": {
    "name": "Ted",
    "color": "green"
  },
  "3": {
    "name": "Alice",
    "color": "blue"
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
  openStudents: [
    {"openWorksheets": [ "(OLD) 03.01-05 HF (USA) 1-1 WS", "(OLD) 3.02 C10000 (USA) 1-1 WS" ], "studentIDNumber": "1"},
    {"openWorksheets": [], "studentIDNumber": "2"}
  ],
  setOpenStudents: (newValue)=>{ set( ()=>({ openStudents: newValue }) ) },
  deleteOpenStudent: (studentIDNumber)=>{
    let newOpenStudents = useSessionStateStore.getState().openStudents.filter( (student)=> student.studentIDNumber !== studentIDNumber )
    set( ()=>({ openStudents: newOpenStudents }) )
  },
  addOpenStudentToBottom: (studentIDNumber)=>{
    let newOpenStudents = useSessionStateStore.getState().openStudents.concat({"openWorksheets": [], "studentIDNumber": studentIDNumber})
    set( ()=>({ openStudents: newOpenStudents }) )
  },
  
  currentPage: "WorksheetViewer",
  setCurrentPage: (newValue)=>{ set( ()=>({ currentPage: newValue }) ) },
  currentWorksheet: { openStudentIndex: null, worksheetIndex: null },
  setCurrentWorksheet: (openStudentIndex, worksheetIndex)=>{ set( ()=>({ currentWorksheet: { openStudentIndex: openStudentIndex, worksheetIndex: worksheetIndex } }) ) },
  userIsMovingCurrentWorksheet: false,
  setUserIsMovingCurrentWorksheet: (newValue)=>{ set( ()=>({ userIsMovingCurrentWorksheet: newValue }) ) },
  userCanClickAnywhereToDisableMovingCurrentWorksheet: false,
  setUserCanClickAnywhereToDisableMovingCurrentWorksheet: (newValue)=>{ set( ()=>({ userCanClickAnywhereToDisableMovingCurrentWorksheet: newValue }) ) }
}))

const useUserSettingsStore = create( (set)=> ({
  //settings go here
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
    touchAction: userHasPinchZoomed ? "auto" : "pinch-zoom" //If the user has pinch zoomed, allow panning. If not, disable panning
  }
  
  const sessionStateStore = useSessionStateStore()
  const currentPage = sessionStateStore.currentPage
  /*
  When HomePage mounts for the first time, initialize allStudentsStore by grabbing
  allStudents from localStorage. Pass an empty dependency array [] into useEffect to tell React
  to only run this code the first time HomePage mounts.
  */
  useEffect( ()=>{
    //useAllStudentsStore.getState().initAllStudents();
    window.useAllStudentsStore = useAllStudentsStore; //call useAllStudentsStore.getState() when accessing in the dev console.
    window.useSessionStateStore = useSessionStateStore;
    
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
      if(sessionStateStore.userIsMovingCurrentWorksheet && sessionStateStore.userCanClickAnywhereToDisableMovingCurrentWorksheet){
        console.log("is called")
        sessionStateStore.setUserIsMovingCurrentWorksheet(false)
        sessionStateStore.setUserCanClickAnywhereToDisableMovingCurrentWorksheet(false)
      }
    }
  }
  return (
    <div style={homePageStyle} onClick={onClick}>
      {allPages[currentPage]}
    </div>
  )
}

const onDocumentTouchEndOrMouseUp = function(){
  //Update userhaspinchzoomed store, but only if the value has changed.
  //(to prevent unnecessary rerenders)
  const newUserHasPinchZoomed = calcUserHasPinchZoomed()
  const oldUserHasPinchZoomed = useUserHasPinchZoomedStore.getState().userHasPinchZoomed
  if(oldUserHasPinchZoomed !== newUserHasPinchZoomed){
    useUserHasPinchZoomedStore.getState().setUserHasPinchZoomed(newUserHasPinchZoomed)
  }
}

export { useAllStudentsStore, useSessionStateStore, useUserSettingsStore, worksheets }
export default HomePage
