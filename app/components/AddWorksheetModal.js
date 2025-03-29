import { GenericModal, CloseButton, GenericPillButton, PressDownButton } from "../constants.js";
import constants from "../constants.js";
import { useAddWorksheetModalIsOpenStore } from "../stores"
import { useSessionStateStore, useUserSettingsStore } from "../page.js"
import {  useRef, useEffect } from "react";
import { create } from "zustand";

const useSearchInputValueStore = create((set) => ({
  searchInputValue: "",
  // setSearchInputValue: (value) => set({ searchInputValue: value }),
  setSearchInputValue: (value) => {
    if(['a','b','c','1','2','3','4','5','6'].includes(value.toLowerCase())){
      value = "0" + value
    }
    set({ searchInputValue: value });
    const inputToLevelMap = {
      "0": 0,
      "0a": 0,
      "0b": 0,
      "0c": 0,
      "01": 1,
      "02": 2,
      "03": 3,
      "04": 4,
      "05": 5,
      "06": 6
    }
    //Get search results
    if(value.length >= 2){
      searchResultsStore.getState().setSearchResults(getSearchResults(value))
    } else if(value == "0") {
      //Return results for level 0
      const searchResults = [...getSearchResults("0a"), ...getSearchResults("0b"), ...getSearchResults("0c")]
      searchResultsStore.getState().setSearchResults(searchResults)
    } else {
      searchResultsStore.getState().setSearchResults([])
    }
    
    //Reset highlighted index to 0
    useHighlightedResultIndexStore.getState().setHighlightedResultIndex(0)
    
    //Update which level is selected
    if(value == "0"){
      useSelectedLevelStore.getState().setSelectedLevelInteger("0")
      return
    }
    if (value.length >= 2) {
      const prefix = value.slice(0, 2).toLowerCase();
      if (inputToLevelMap.hasOwnProperty(prefix)) {
        useSelectedLevelStore.getState().setSelectedLevelInteger(inputToLevelMap[prefix]);
        return
      }
    }
    //If we're here, there is no match, so set level to all
    if(value !== "0"){
      useSelectedLevelStore.getState().setSelectedLevelInteger("All");
    }
  },
  // appendToSearchInputValue: (value) => set((state) => ({ searchInputValue: state.searchInputValue + value })),
}))

const useSelectedLevelStore = create((set) => ({
  selectedLevelInteger: "All",
  setSelectedLevelInteger: (value) => set({ selectedLevelInteger: value }),
}))

const searchResultsStore = create((set) => ({
  searchResults: [],
  setSearchResults: (value) => {
    set({ searchResults: value })
    set({ resultElementRefs: [] }) //Reset resultElementRefs when search results change
  },
  resultElementRefs: [],
  setResultElementRefs: (value) => set({ resultElementRefs: value }),
}))

const useHighlightedResultIndexStore = create((set) => ({
  highlightedResultIndex: 0,
  setHighlightedResultIndex: (value) => {
    set({ highlightedResultIndex: value })
    //Scroll the new result into view
    const { resultElementRefs } = searchResultsStore.getState()
    if(resultElementRefs.length > 0){
      resultElementRefs[value].scrollIntoView({ behavior: "instant", block: "nearest" })
    }
  }
}))

function onKeyDownInAddWorksheetModal(event) {
  //If user pressed up or down arrow key, update highlighted result index
  //If pressed enter, accept highlighted result
  //If user pressed any other key, assume they're trying to type in the serach input
  let userIsNavigating = false
  const { searchResults } = searchResultsStore.getState();
  //If there are no search results, do nothing
  if(searchResults.length > 0){
    const { highlightedResultIndex } = useHighlightedResultIndexStore.getState();
    let newHighlightedResultIndex = highlightedResultIndex
    if(event.key == "ArrowDown") {
      newHighlightedResultIndex ++
      event.preventDefault();
      userIsNavigating = true
    }
    if(event.key == "ArrowUp") {
      newHighlightedResultIndex --
      event.preventDefault();
      userIsNavigating = true
    }
    //Correct newhighlightedresultindex to be within range of search results
    if(newHighlightedResultIndex < 0)newHighlightedResultIndex = searchResults.length - 1
    if(newHighlightedResultIndex >= searchResults.length)newHighlightedResultIndex = 0
    
    //Only update highlightedresultindex if it's changed
    if( newHighlightedResultIndex != highlightedResultIndex){
      useHighlightedResultIndexStore.getState().setHighlightedResultIndex(newHighlightedResultIndex)
    }
    
    if(event.key == "Enter"){
      attemptToAddHighlightedWorksheet()
      event.preventDefault();
      userIsNavigating = true
    }
  }
  
  
  if(!userIsNavigating){
    document.querySelector("#searchInput").focus()
  }
}

export function AddWorksheetModal(){
  useEffect(() => {
    useSearchInputValueStore.getState().setSearchInputValue("")
    document.addEventListener("keydown", onKeyDownInAddWorksheetModal)
    
    //For debugging in console
    window.useSelectedLevelStore = useSelectedLevelStore
    window.getSearchResults = getSearchResults
    window.searchResultsStore = searchResultsStore
    window.useHighlightedResultIndexStore = useHighlightedResultIndexStore
    
    return () => {
      document.removeEventListener("keydown", onKeyDownInAddWorksheetModal)
    }
  }, [])
  const onCloseClick = function(){
    useAddWorksheetModalIsOpenStore.getState().setAddWorksheetModalIsOpen(false)
  }
  
  const { indexOfStudentAddingFor } = useAddWorksheetModalIsOpenStore.getState() //We don't need a hook here because this value won't change while modal is open
  // ^ This value is index of student in openStudents
  const { openStudents } = useSessionStateStore.getState() //This will give us the list of students to get the name from  
  const studentName = openStudents[indexOfStudentAddingFor].name
  
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
        
        <div style={
          {
            flexGrow: "1", 
            boxSizing: "border-box",
            marginRight: "20px",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            containerType: "size"}}>
          <SearchBar />
          <LevelButtonsRow />
          <SearchResultsContainer />
        </div>
        
        <Keypad />
      </div>
    </GenericModal>
  )
}

function SearchResultsContainer(){
  const { searchResults } = searchResultsStore()
  const { highlightedResultIndex } = useHighlightedResultIndexStore()
  let searchResultDivStyle = {
    width: "100%",
    padding: "10px 0px",
    borderBottom: "1px solid #D1C7C5",
    cursor: "pointer"
  }
  let searchResultDivHighlightedStyle = {
    backgroundColor: "#EAE4D4",
    borderBottom: "1px solid #EAE4D4"
  }
  searchResultDivHighlightedStyle = { ...searchResultDivHighlightedStyle, ...searchResultDivStyle }
  let searchResultFirstDivStyle = {
    borderTop: "1px solid #D1C7C5",
  }
  searchResultFirstDivStyle = { ...searchResultFirstDivStyle, ...searchResultDivStyle }
  
  const chooseStyle = (index) => {
    if(index == highlightedResultIndex)return searchResultDivHighlightedStyle
    if(index == 0)return searchResultFirstDivStyle
    return searchResultDivStyle
  }
  /*
  We need a ref to every search result div node in case we need to scroll it
  into view with element.scrollIntoView() when user changes highlighted result index.
  Normally, you set the "ref" property of a component to a variable like "myDivRef".
  But in this case we have an array of elements, rather than a single variable.
  The way to add refs to an array is to pass a callback function into the
  component's "ref" property.
  */
  
  const onSearchResultClick = function(index){
    const worskheetId = searchResults[index]
    addWorksheetToStudent(worskheetId, true) //Close modal after adding worksheet
  }
  const refCallbackFunction = (node) => {
    //React passes "null" in for the node when a component is unmounted.
    //We don't want unmounted nodes in our array of refs, so if it's null
    //we will return and not add it to the array.
    if(node == null)return
    /*
    The react docs say that in your ref callback function, you can store
    the DOM nodes in a useRef, but I've opted to store the nodes in a zustand
    store instead. To my knowledge, this should be fine.
    https://react.dev/learn/manipulating-the-dom-with-refs
    */
    const { resultElementRefs } = searchResultsStore.getState()
    resultElementRefs.push(node)
    
    //No cleanup function is returned here because the resultElementRefs array
    //should be emptied anyway every time the search results change.
  }
  return (
    <div style={{overflowY: "auto", height: "100%", boxSizing: "border-box", marginTop: "20px"}}>
      {searchResults.map((result, index) => (
        <div onClick={ ()=>{ onSearchResultClick(index) } } style={ chooseStyle(index) } key={index} ref={refCallbackFunction}>
          {result}
        </div>
        
      ))}
    </div>
  )
}

function SearchBar(){
  const { searchInputValue } = useSearchInputValueStore()
  
  const searchBarWrapperStyle = {
    width: "100%",
    height: "50px",
    flexShrink: "0",
    border: "1px solid #A9A09E",
    borderRadius: "200px",
    boxSizing: "border-box",
    marginTop: "20px",
    overflow: "hidden",
    display: "flex",
    // flexGrow: "1"
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
        id="searchInput"
        autoComplete="off"
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
  
  const onClick = () => {
    useSelectedLevelStore.getState().setSelectedLevelInteger(levelInteger)
    if(levelInteger == "All"){
      useSearchInputValueStore.getState().setSearchInputValue("")
    } else if(levelInteger == "0") {
      useSearchInputValueStore.getState().setSearchInputValue("0")
    } else {
      useSearchInputValueStore.getState().setSearchInputValue("0" + levelInteger)
    }
  }
  return (
    <GenericPillButton isFilled={false} isShort={true} additionalStyleObject={levelButtonStyle} functionToTrigger={ onClick }>{label}</GenericPillButton>
  )
}

function KeypadKey({val}){
  const keypadKeyStyle = {
    backgroundColor: "white",
    border: "1px solid #DAD6D5",
    boxShadow: "0px 1px 4px #0000001a",
    width: "50px",
    height: "50px",
    color: "#3D3D3D",
    borderRadius: "7px",
    fontFamily: "Roboto, sans-serif",
    fontSize: "30px",
    // cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }
  
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
      attemptToAddHighlightedWorksheet()
      return
    }
    //User inputted a number or A, B, or C
    let currentVal = useSearchInputValueStore.getState().searchInputValue
    useSearchInputValueStore.getState().setSearchInputValue(currentVal + val)
  }
  
  const invisWrapperStyle = {
    width: "55px",
    height: "55px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    backgroundColor: "white",
    border: "none",
    padding: "0px",
    userSelect: "none"
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
    invisWrapperStyle.width = "100px"
    keypadKeyStyle.width = "100%"
    keypadKeyStyle.backgroundColor = "#eae4d444"
    keypadKeyStyle.border = "1px solid rgb(204, 194, 166)"
    keypadKeyStyle.fontSize = "20px"
  } else {
    innerContent = val
  }
  
  let isDisabled = false;
  if(val == "open"){
    isDisabled = searchResultsStore().searchResults.length == 0
  }
  if(isDisabled){
    keypadKeyStyle.backgroundColor = "#EBEBEB"
    keypadKeyStyle.border = "none"
    keypadKeyStyle.color = "#8c8c8c"
    invisWrapperStyle.cursor = "not-allowed"
  }
  return (
    <PressDownButton
      // style={keypadKeyStyle}
      style={invisWrapperStyle}
      functionToTrigger={ ()=> { onKeypadKeyPress(val) }}
      disabled={isDisabled}
    >
      <div style={keypadKeyStyle}>
        {innerContent}
      </div>
    </PressDownButton>
  )
}

function Keypad(){
  
  const keypadStyle = {
    margin: "auto 0"
  }
  
  const keyRowStyle = {
    display: "flex",
    // gap: "6px",
    justifyContent: "center",
    // marginBottom: "6px"
  }
  const rowWithOpenStyle = {
    display: "flex",
    justifyContent: "center"
  }
  const bottomRowStyle = {
    display: "flex",
    // gap: "6px",
    justifyContent: "center",
    marginBottom: "10px"
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

function getSearchResults(query){
  /*
  The originalQuery is the ver batim query that the user inputted.
  The integerAndLetterQuery allows all letters and all integers.
  The integerQuery strips anything that isn't an integer (A, B, or C is allowed in the first two characters).
  The letterQuery strips anything from the query that isn't a letter A-Z.
  
  The integerQuery is used for filtering search results.
  The letterQuery is used for sorting the filtered search results.
  */
  let integerAndLetterQuery = query.toUpperCase().replace(/[^0-9A-Z]/gi, '')
  if(integerAndLetterQuery.length < 2)return [];
  //In first two characters of query, only allow integers and A, B, or C
  let firstTwoCharactersOfQuery = integerAndLetterQuery.toUpperCase().slice(0, 2).replace(/[^0-9ABC]/gi, '')
  //In the rest of the query, only allow integers
  let remainingCharactersOfQuery = integerAndLetterQuery.toUpperCase().slice(2).replace(/[^0-9]/gi, '')
  let integerQuery = firstTwoCharactersOfQuery + remainingCharactersOfQuery
  let letterQuery = query.toUpperCase().replace(/[^A-Z]/gi, '')
  
  let exactResults = []
  const sortResultsFunction = (a, b) => {
    //Sort by a variety of conditions
    
    //Sort by whether worksheet is (OLD) 
    //(OLD) worksheets should always be on the bottom
    if(a.includes("(OLD)") && !b.includes("(OLD)"))return 1
    if(!a.includes("(OLD)") && b.includes("(OLD)"))return -1
    
    //Sort by whether letters in worksheet ID match letterQuery
    let aLetterMatches = a.toUpperCase().replace(/[^A-Z]/gi, '').includes(letterQuery)
    let bLetterMatches = b.toUpperCase().replace(/[^A-Z]/gi, '').includes(letterQuery)
    if(aLetterMatches && !bLetterMatches)return -1
    if(!aLetterMatches && bLetterMatches)return 1
    
    /*
    The below sorting condition has been removed because it causes a behavior
    that users might not want:
    When searching "02162" it causes "02.16-20 HF 1-1 WS" to appear above "02.16 MMD 2-2 WS"
    
    The idea is: sort by whether first portion of ID starts with query, when
    separated by spaces.
    For example, if query is "0113" then "01.13 HCQCFS 1-1 WS" should appear above
    "01.MH1 3-6 WS", which is what users will expect when searching "0113".
    Usually, this will be the case anyway, which happens to be a consequence of the
    worksheet ids being sorted alphabetically.
    */
    // let aFirstWordMatches = a.split(" ")[0].replace(/[^0-9ABC]/gi, '').startsWith(query)
    // let bFirstWordMatches = b.split(" ")[0].replace(/[^0-9ABC]/gi, '').startsWith(query)
    // if(aFirstWordMatches && !bFirstWordMatches)return -1
    // if(!aFirstWordMatches && bFirstWordMatches)return 1
    
    //Next, sort by whether worksheet is (USA) 
    if(a.includes("(USA)") && !b.includes("(USA)"))return 1
    if(!a.includes("(USA)") && b.includes("(USA)"))return -1
    
    return 0
    
  }
  if(worksheets.integerMap[integerQuery]){
    exactResults = worksheets.integerMap[integerQuery]
  }
  // exactResults.reverse() //for testing
  exactResults.sort(sortResultsFunction) //Technically this might mutate worksheets.integerMap[query] but it doesn't really matter
  let startsWithResults = []
  for(let i in worksheets.integerMap){
    if(i.startsWith(integerQuery)){
      const resultsToAppend = worksheets.integerMap[i]
      resultsToAppend.forEach(result => {
        if (!exactResults.includes(result)) {
          startsWithResults.push(result);
        }
      });
    }
  }
  // startsWithResults.reverse() //for testing
  startsWithResults.sort(sortResultsFunction)
  
  return [...exactResults, ...startsWithResults]
}

function addWorksheetToStudent(worksheetId, closeAddWorksheetModal){
  const { indexOfStudentAddingFor } = useAddWorksheetModalIsOpenStore.getState()
  const { openStudents, setCurrentPageOfWorksheet, setCurrentWorksheet } = useSessionStateStore.getState()
  const student = openStudents[indexOfStudentAddingFor]
  // If this student doesn't already have this worksheet open, add it
  const indexOfThisWorksheetInOpenWorksheets = findWorksheetWithIdInArray(worksheetId, student.openWorksheets)
  let indexOfWorksheetToFocus;
  let newCurrentPage = null;
  if(indexOfThisWorksheetInOpenWorksheets == null){
    newCurrentPage = (useUserSettingsStore.getState().pageView == "single") ? 1 : 0
    student.openWorksheets.push({"id": worksheetId, pageLeftOff: newCurrentPage, notes: ""})
    indexOfWorksheetToFocus = student.openWorksheets.length - 1
    // console.log("didn't find worksheet so added it")
  } else {
    indexOfWorksheetToFocus = indexOfThisWorksheetInOpenWorksheets
    // console.log("found worksheet at index " + indexOfThisWorksheetInOpenWorksheets)
  }
  
  //Make the new worksheet the currentWorksheet in sessionstatestore
  setCurrentWorksheet(indexOfStudentAddingFor, indexOfWorksheetToFocus)
  if(newCurrentPage !== null){
    setCurrentPageOfWorksheet(newCurrentPage)
  }
  
  if(closeAddWorksheetModal){
    useAddWorksheetModalIsOpenStore.getState().setAddWorksheetModalIsOpen(false)
  }
}

function attemptToAddHighlightedWorksheet(){
  //Open the highlighted search result
  const { searchResults } = searchResultsStore.getState()
  if(searchResults.length == 0)return;
  const { highlightedResultIndex } = useHighlightedResultIndexStore.getState()
  const worksheetId = searchResults[highlightedResultIndex]
  addWorksheetToStudent(worksheetId, true) //Close modal after adding worksheet
}

function findWorksheetWithIdInArray(worksheetId, arrayToSearch){
  for(let i in arrayToSearch){
    if(arrayToSearch[i].id == worksheetId)return i
  }
  return null
}