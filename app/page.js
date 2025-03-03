'use client'
//     ikeb108.github.io/sam_browser/out
import React, { useEffect } from 'react'
import { create } from 'zustand'
import WorksheetViewer from './components/WorksheetViewer.js'
import SettingsPage from './components/SettingsPage.js'

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
    {"openWorksheets": [], "studentIDNumber": "1"},
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
  setCurrentPage: (newValue)=>{ set( ()=>({ currentPage: newValue }) ) }
}))

const useUserSettingsStore = create( (set)=> ({
  //settings go here
}))

const worksheetImages = {}
const worksheets = {}

function HomePage() {
  const homePageStyle = {
    fontFamily: "Arial, sans-serif",
    height: "100%",
    width: "100%"
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
  }, [])
  /*
  The dependency array we pass into useEffect tells React which variables to look
  for changes in. When any of these variables change, the function in useEffect() is
  triggered. Empty = run only once (on component mount).
  */
  return (
    <div style={homePageStyle}>
      {allPages[currentPage]}
    </div>
  )
}

export { useAllStudentsStore, useSessionStateStore, useUserSettingsStore, worksheets, worksheetImages }
export default HomePage
