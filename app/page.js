'use client'
import React, {useState, useEffect } from 'react'
import { create } from 'zustand'

const panelPadding = "10px"
const worksheetSelectionPanelWidth = "300px"

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
    "name": "John Doe",
    "color": "red"
  },
  "2": { //id number for the student (to avoid glitches w same-name students)
    "name": "Jane Doe",
    "color": "green"
  }
}
useAllStudentsStore.getState().setAllStudents(fillerStudentData)

const useSessionStateStore = create( (set)=> ({
  openStudents: ["1", "2"], //list of ids of open students
  setOpenStudents: (newValue)=>{ set( ()=>({ openStudents: newValue }) ) }
}))

function HomePage() {
  const homePageStyle = {
    fontFamily: "Arial, sans-serif"
  }
  /*
  When HomePage mounts for the first time, initialize allStudentsStore by grabbing
  allStudents from localStorage. Pass an empty dependency array [] into useEffect to tell React
  to only run this code the first time HomePage mounts.
  */
  useEffect( ()=>{
    window.useAllStudentsStore = useAllStudentsStore; //call useAllStudentsStore.getState() when accessing in the dev console.
  }, [])
  /*
  The dependency array we pass into useEffect tells React which variables to look
  for changes in. When any of these variables change, the function in useEffect() is
  triggered. Empty = run only once (on component mount).
  */
  return (
    <div style={homePageStyle}>
      <WorksheetViewer />
    </div>
  )
}


function WorksheetViewer(){
  const worksheetViewerStyle = {
    width: "100%",
    height: "100vh",
    backgroundColor: "lightgrey",
    display: "flex",
    flexShrink: 0
  }
  
  
  return (
    <div style={worksheetViewerStyle}>
      <PagePanel />
      <WorksheetSelectionPanel />
    </div>
  )
}

function PagePanel(){
  const pagePanelStyle = {
    flexGrow: 1,
    flexBasis: "0%",
    height: "100%",
    backgroundColor: "pink",
    padding: panelPadding,
    boxSizing: "border-box",
    display: "flex"
  }
  return (
    <div style={pagePanelStyle}>
      <PageContainer isLeftOrRight="left" />
      <PageContainer isLeftOrRight="right" />
    </div>
  )
}

function PageContainer( {isLeftOrRight} ){
  const pageContainerStyle = {
    width: "50%",
    height: "100%",
    backgroundColor: "lightgreen",
    position: "relative"
  }
  return (
    <div style={pageContainerStyle}>
      
      <PageImage imageSrc="placeholderWorksheetPage.webp" />
      <ChangePageButton isLeftOrRight={isLeftOrRight} />
    </div>
  )
}

function ChangePageButton({isLeftOrRight}){
  
  let changePageButtonStyle = {
    position: "absolute",
    bottom: "0px",
    padding: "20px",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  }
  
  if(isLeftOrRight == "left"){
    changePageButtonStyle.left = "0px"
  } else {
    changePageButtonStyle.right = "0px"
  }
  let buttonText = isLeftOrRight == "left" ? "🡠" : "🡢"
  return (
    <button style={changePageButtonStyle} className="turn-page-button">{buttonText}</button>
  )
}

function PageImage({ imageSrc }){
  const pageImageStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  }
  return (
    <img src={imageSrc} style={pageImageStyle} />
  )
}

function WorksheetSelectionPanel(){
  const worksheetSelectionPanelStyle = {
    width: worksheetSelectionPanelWidth,
    height: "100%",
    backgroundColor: "lightblue",
    padding: panelPadding,
    boxSizing: "border-box"
  }
  
  const openStudents = useSessionStateStore().openStudents;
  return (
    <div style={worksheetSelectionPanelStyle}>
      {
        openStudents.map(
          studentIDNumber => (
            <StudentPanel key={studentIDNumber} studentIDNumber={studentIDNumber} />
          )
        )
      }
    </div>
  )
  
}

function StudentPanel({studentIDNumber}){
  const { allStudents } = useAllStudentsStore.getState();
  console.log(allStudents)
  let student = allStudents[studentIDNumber]
  const studentPanelStyle = {
    width: "100%",
    backgroundColor: "lightyellow",
    padding: panelPadding,
    boxSizing: "border-box",
    marginBottom: panelPadding
  }
  // const student = allStudents[studentIDNumber]
  return (
    <div style={studentPanelStyle}>
      <p style={{margin: "0"}}>{student.name}</p>
      <p style={{margin: "0"}}>{student.color}</p>
    </div>
  )
}

export default HomePage
