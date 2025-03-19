import { GenericModal, CloseButton, GenericPillButton } from "../constants.js";
import constants from "../constants.js";
import { useAddWorksheetModalIsOpenStore } from "../stores"
import { useSessionStateStore, useAllStudentsStore } from "../page.js"
import {  useState } from "react";
import { create } from "zustand";

const useSearchInputValueStore = create((set) => ({
  searchInputValue: "",
  setSearchInputValue: (value) => set({ searchInputValue: value }),
  appendToSearchInputValue: (value) => set((state) => ({ searchInputValue: state.searchInputValue + value })),
}))

const useSelectedLevelStore = create((set) => ({
  selectedLevelInteger: "All",
  setSelectedLevelInteger: (value) => set({ selectedLevelInteger: value }),
}))

export function AddWorksheetModal(){
  const onCloseClick = function(){
    useAddWorksheetModalIsOpenStore.setState({ addWorksheetModalIsOpen: false })
  }
  
  const { studentAddingFor } = useAddWorksheetModalIsOpenStore.getState() //We don't need a hook here because this value won't change while modal is open
  // ^ This value is student ID number.
  let studentName
  if(studentAddingFor == "other"){
    studentName = "Other"
  } else {
    const { allStudents } = useAllStudentsStore.getState()
    studentName = allStudents[studentAddingFor].name
  }
  return (
    <GenericModal blockBehind={true} widthSetting="96%" heightSetting="96%" additionalStyleObject={{boxSizing: "border-box", display: "flex", flexDirection:"column", maxWidth: "1000px", maxHeight: "700px"}}>
      <div width="100%" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}> {/*Container for modal title and close button*/}
        <h1 style={{
          "fontFamily": "Roboto, sans-serif",
          "fontSize": "18px",
          "fontWeight": "normal",
          "margin": "0"
        }}>Add Worksheet for {studentName}</h1>
        <CloseButton buttonWidthString="37px" iconWidthString="22px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{ top: "10px", right: "10px" }} />
      </div>
      
      <div style={{display: "flex", height: "100%"}}> {/* Body of the modal*/}
        
        <div style={{flexGrow: "1", boxSizing: "border-box", marginRight: "20px"}}>
          <SearchBar />
          <LevelButtonsRow />
        </div>
        
        <Keypad />
      </div>
    </GenericModal>
  )
}

function SearchBar(){
  const { searchInputValue } = useSearchInputValueStore()
  
  const searchBarWrapperStyle = {
    width: "100%",
    height: "50px",
    border: "1px solid #A9A09E",
    borderRadius: "200px",
    boxSizing: "border-box",
    marginTop: "20px",
    overflow: "hidden",
    display: "flex"
  }
  const searchBarStyle = {
    color: "#3d3d3d",
    fontFamily: "Roboto, sans-serif",
    fontSize: "16px",
    width: "100%",
    height: "100%",
    border: "none",
    padding: "17px 24px",
    boxSizing: "border-box",
    outline: "none"
  }
  const onClearClick = function(){
    const { setSearchInputValue } = useSearchInputValueStore.getState()
    setSearchInputValue("")
  }
  const handleInputChange = (event) => {
    const value = event.target.value;
    useSearchInputValueStore.getState().setSearchInputValue(value);
  };
  const clearButtonStyle = {
    width: 60,
    height: "100%"
  }
  return (
    <div style={searchBarWrapperStyle}>
      <input
        type="text"
        placeholder="Search a worksheet ID..."
        style={searchBarStyle}
        value={searchInputValue}
        onChange={handleInputChange}
      />
      <CloseButton iconWidthString="14px" color="black" onClickFunction={onClearClick} additionalStyleObject={clearButtonStyle} />
    </div>
  )
}

function LevelButtonsRow(){
  const levelButtonsRowStyle = {
    display: "flex",
    gap: "8px",
    marginTop: "20px",
    flexWrap: "wrap"
  }
  return (
    <div style={levelButtonsRowStyle}>
      <LevelButton levelInteger="All" />
      <LevelButton levelInteger="0" />
      <LevelButton levelInteger="1" />
      <LevelButton levelInteger="2" />
      <LevelButton levelInteger="3" />
      <LevelButton levelInteger="4" />
      <LevelButton levelInteger="5" />
      <LevelButton levelInteger="6" />
    </div>
  )
}

function LevelButton({levelInteger}){
  const { selectedLevelInteger } = useSelectedLevelStore()
  let label = "Lvl " + levelInteger
  if(levelInteger == "All")label = "All"
  const levelButtonStyle = {
    padding: "9px 14px",
    margin: "0",
    border: "2px solid #DAD6D5",
    fontWeight: "normal"
  }
  
  if(selectedLevelInteger == levelInteger){
    levelButtonStyle.backgroundColor = "#E6E6EB"
  }
  return (
    <GenericPillButton isFilled={false} isShort={true} additionalStyleObject={levelButtonStyle}>{label}</GenericPillButton>
  )
}

function Keypad(){
  const onKeypadKeyPress = function(val){
    if(val == "clear"){
      useSearchInputValueStore.getState().setSearchInputValue("")
      return
    }
    if(val == "backspace"){
      const { searchInputValue, setSearchInputValue } = useSearchInputValueStore.getState()
      setSearchInputValue(searchInputValue.slice(0, -1))
      return
    }
    if(val == "open"){
      return
    }
    useSearchInputValueStore.getState().appendToSearchInputValue(val)
  }
  const KeypadKey = ({val}) => {
    const keypadKeyStyle = {
      backgroundColor: "white",
      border: "1px solid #DAD6D5",
      boxShadow: "0px 1px 4px #0000001a",
      width: "55px",
      height: "55px",
      color: "#3D3D3D",
      borderRadius: "10px",
      fontFamily: "Roboto, sans-serif",
      fontSize: "30px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }
    let innerContent;
    if(val == "backspace"){
      innerContent = <img src={ constants.iconsFolderPath + "/backspace.svg"} alt="Backspace" style={{width: "26px", height:"26px"}} />
    } else if(val == "clear"){
      innerContent = "Clear"
      keypadKeyStyle.backgroundColor = constants.redColor
      keypadKeyStyle.color = "white"
      keypadKeyStyle.fontSize = "20px"
    } else if(val == "open"){
      innerContent = "Open"
      keypadKeyStyle.width = "100px"
      keypadKeyStyle.backgroundColor = "#eae4d444"
      keypadKeyStyle.border = "1px solid rgb(204, 194, 166)"
      keypadKeyStyle.fontSize = "20px"
    } else {
      innerContent = val
    }
    return (
      <button
        onMouseDown={ (e)=>{ e.preventDefault; onKeypadKeyPress(val) } }
        onTouchStart={ (e) => { e.preventDefault; onKeypadKeyPress(val) } }
        style={keypadKeyStyle}>
        {innerContent}
      </button>
    )
  }
  
  const keypadStyle = {
    margin: "auto 0"
  }
  
  const keyRowStyle = {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    marginBottom: "6px"
  }
  const rowWithOpenStyle = {
    display: "flex",
    gap: "6px",
    justifyContent: "center"
  }
  const bottomRowStyle = {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    marginBottom: "20px"
  }
  return (
    <div style={keypadStyle}>
      <div style={keyRowStyle}>
        <KeypadKey val="A" />
        <KeypadKey val="B" />
        <KeypadKey val="C" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="1" />
        <KeypadKey val="2" />
        <KeypadKey val="3" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="4" />
        <KeypadKey val="5" />
        <KeypadKey val="6" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="7" />
        <KeypadKey val="8" />
        <KeypadKey val="9" />
      </div>
      <div style={bottomRowStyle}>
        <KeypadKey val="backspace" />
        <KeypadKey val="0" />
        <KeypadKey val="clear" />
      </div>
      <div style={rowWithOpenStyle}>
        <KeypadKey val="open" />
      </div>
    </div>
  )
}