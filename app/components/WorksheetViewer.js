import constants from "../constants.js"
import { CloseButton } from "../constants.js"
import { useAllStudentsStore, useSessionStateStore } from "../page.js"
import { useStatusMessageStore, useAWorksheetProcessIsBusyStore, useUserHasPinchZoomedStore } from "../stores.js"

import { useEffect } from "react"
function WorksheetViewer(){
  const { userHasPinchZoomed } = useUserHasPinchZoomedStore()
  const worksheetViewerStyle = {
    width: "100%",
    height: "100%",
    backgroundColor: userHasPinchZoomed ? "green": "red",
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
    backgroundColor: "lightgrey",
    padding: "16px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  }
  
  const aWorksheetProcessIsBusy = useAWorksheetProcessIsBusyStore().aWorksheetProcessIsBusy
  const statusMessage = useStatusMessageStore().statusMessage
  let divToFill = null
  if(aWorksheetProcessIsBusy){
    divToFill = (
      <div style={{display:"flex", height:"0%", flexGrow: 1, backgroundColor:"lightblue"}}>
        <p>{statusMessage}</p>
      </div>
    )
  } else {
    divToFill = (
      <div style={{display:"flex", height:"0%", flexGrow: 1, backgroundColor:"lightblue"}}>
        <PageContainer isLeftOrRight="left" />
        <PageContainer isLeftOrRight="right" />
      </div>
    )
  }
  return (
    <div style={pagePanelStyle}>
      { divToFill }
      {/* <div style={{display:"flex", flexGrow: 1, flexDirection: "column", height:"100%"}}>
      </div> */}
      <PagePanelFooter />
    </div>
  )
}

function PagePanelFooter(){
  const pagePanelFooterStyle = {  padding: "16px" }
  const settingsButtonStyle = {
    padding: "5px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "18px"
  }
  const settingsButton = <button onClick={ ()=>{ useSessionStateStore.getState().setCurrentPage("SettingsPage") } } style={settingsButtonStyle}>⚙️</button>
  return (
    <div style={pagePanelFooterStyle}>
      { settingsButton }
    </div>
  )
}

function PageContainer( {isLeftOrRight} ){
  const pageContainerStyle = {
    width: "50%",
    height: "100%",
    // backgroundColor: "lightgreen",
    position: "relative"
  }
  if(isLeftOrRight == 'left'){
    pageContainerStyle.marginRight = "16px";
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
    objectFit: "contain",
  }
  return (
    <img src={imageSrc} style={pageImageStyle} />
  )
}

function WorksheetSelectionPanel(){
  const worksheetSelectionPanelStyle = {
    width: constants.worksheetSelectionPanelWidth,
    height: "100%",
    // backgroundColor: "lightblue",
    padding: "18px",
    paddingLeft: "0px",
    boxSizing: "border-box",
    overflowY: "scroll"
  }
  
  const openStudents = useSessionStateStore().openStudents;
  useEffect( ()=> {
    window.openStudents = openStudents
  }, [])
  return (
    <div style={worksheetSelectionPanelStyle}>
      {
        openStudents.map( (studentData, index) => {
          return <StudentSessionCard key={studentData.studentIDNumber} studentIDNumber={studentData.studentIDNumber} />
        } )
      }
    </div>
  )
}

function StudentSessionCard({studentIDNumber}){
  const { allStudents } = useAllStudentsStore.getState();
  const { openStudents } = useSessionStateStore.getState();
  let student = allStudents[studentIDNumber]
  const studentSessionCardStyle = {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    // border: `1px solid ${constants.softBorderColor}`,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.45)",
    boxSizing: "border-box",
    marginBottom: "24px",
    overflow: "hidden",
    position: "relative"
  }
  
  return (
    <div style={studentSessionCardStyle}>
      <StudentSessionCardHeader studentName={student.name} studentIDNumber={studentIDNumber} />
      <StudentSessionCardWorksheetList studentIDNumber={studentIDNumber} />
      <StudentSessionCardFooter studentIDNumber={studentIDNumber} />
    </div>
  )
}

function getStudentFromOpenStudents(studentIDNumber){
  const openStudents = useSessionStateStore.getState().openStudents;
  const thisStudent = openStudents.filter( (student)=> student.studentIDNumber == studentIDNumber )[0]
  const thisStudentIndex = openStudents.findIndex( (student)=> student.studentIDNumber == studentIDNumber )
  return { thisStudent, thisStudentIndex }
}

function StudentSessionCardWorksheetList({ studentIDNumber }){
  const {allStudents} = useAllStudentsStore.getState()
  const {openStudents, currentWorksheet} = useSessionStateStore()
  
  const worksheetListStyle = {
    display: "flex",
    flexDirection: "column",
    padding: "14px 14px",
    overflowY: "auto",
    height: "100%"
  }
  
  const {thisStudent, thisStudentIndex} = getStudentFromOpenStudents(studentIDNumber)
  
  const worksheetList = []
  
  for(let i = 0; i < thisStudent.openWorksheets.length; i++){
    const worksheetID = thisStudent.openWorksheets[i]
    const isCurrentWorksheet = currentWorksheet.openStudentIndex == thisStudentIndex && currentWorksheet.worksheetIndex == i
    
    const onClick = function(){
      useSessionStateStore.getState().setCurrentWorksheet(thisStudentIndex, i)
      useSessionStateStore.getState().setUserIsMovingCurrentWorksheet(false)
    }
    
    worksheetList.push(<WorksheetListItem key={worksheetID} worksheetID={worksheetID} isCurrentWorksheet={isCurrentWorksheet} onClick={onClick} />)
  }
  
  return (
    <div style={worksheetListStyle}>
      { worksheetList }
    </div>
  )
}

function WorksheetListItem({ worksheetID, isCurrentWorksheet, onClick }){
  const worksheetListItemStyle = {
    fontFamily: "Roboto, sans-serif",
    fontWeight: "normal",
    fontSize: "14px",
    border: "none",
    backgroundColor: "white",
    padding: "10px",
    cursor: isCurrentWorksheet ? "arrow" : "pointer",
    textAlign: "left", // Align text to the left
    width: "100%", // Ensure the button takes full width
    borderRadius: "500px", // Make the button pill-shaped
    color: "black",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }
  const worksheetNameParagraphStyle = {
    margin: 0,
    whiteSpace: isCurrentWorksheet ? "normal" : "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    flexShrink: 1
  }
  if(isCurrentWorksheet){
    worksheetListItemStyle.backgroundColor = "#55587B26"
    
    const onCloseClick = function(){
      const currentWorksheet = useSessionStateStore.getState().currentWorksheet
      //Remove the worksheet from this student's openWorksheets array
      const thisStudent = useSessionStateStore.getState().openStudents[currentWorksheet.openStudentIndex]
      thisStudent.openWorksheets.splice(currentWorksheet.worksheetIndex, 1)
      //Set the currently open worksheet to null
      useSessionStateStore.getState().setCurrentWorksheet(null, null)
      useSessionStateStore.getState().setUserIsMovingCurrentWorksheet(false)
    }
    
    return (
      <div style={worksheetListItemStyle}>
        <p style={worksheetNameParagraphStyle}>{ worksheetID }</p>
        <div style={{display: "flex"}}>
          <MoveWorksheetButton />
            <CloseButton buttonWidthString="24px" iconWidthString="14px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{flexShrink: 0}} />
        </div>
      </div>
    )
  }
  return (
    <button style={worksheetListItemStyle} onClick={onClick}>
      { worksheetID }
    </button>
  )
}


function MoveWorksheetButton(){
  const moveWorksheetButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    width: "24px",
    height: "24px",
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0px 16px",
    boxSizing: "border-box",
    flexShrink: 0
  }
  const onClickFunction = () => {
    //Toggle whether user is moving a worksheet
    const { userIsMovingCurrentWorksheet, setUserIsMovingCurrentWorksheet, setUserCanClickAnywhereToDisableMovingCurrentWorksheet } = useSessionStateStore.getState()
    if(!userIsMovingCurrentWorksheet){
      console.log("user is now moving a worksheet")
      setUserCanClickAnywhereToDisableMovingCurrentWorksheet(true)
    }
    setUserIsMovingCurrentWorksheet( !userIsMovingCurrentWorksheet )
  }
  return (
    <button style={moveWorksheetButtonStyle} onClick={ onClickFunction }>
      <img src={`${constants.iconsFolderPath}/move.svg`} alt="Move Worksheet" style={{ width: "20px", height: "16px" }} />
    </button>
  )
  
}

function StudentSessionCardFooter({ studentIDNumber }){
  const footerStyle = {
    backgroundColor: "none",
    padding: "14px 14px",
    paddingTop: "0px",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex"
  }
  const circularButtonStyle = {
    backgroundColor: "white",
    border: `2px solid ${constants.softBorderColor}`,
    borderRadius: "50%",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
  
  
  return (
    <div style={footerStyle}>
      <TimerStartButton styleObject={circularButtonStyle} studentIDNumber={studentIDNumber} />
      <AddWorksheetButton styleObject={circularButtonStyle} studentIDNumber={studentIDNumber} />
    </div>
  )
}

function TimerStartButton({ studentIDNumber, styleObject }){
  return (
    <button style={styleObject}>
      <img src={constants.iconsFolderPath + "/timer.svg"} alt="Start timer" style={{ width: "23px", height: "23px" }} />
    </button>
  )
}

function AddWorksheetButton({ studentIDNumber, styleObject }){
  return (
    <button style={styleObject}>
      <img src={constants.iconsFolderPath + "/add.svg"} alt="Add worksheet" style={{ width: "16px", height: "16px" }} />
    </button>
  )
}

function StudentSessionCardHeader({studentName, studentIDNumber}){
  const { allStudents } = useAllStudentsStore.getState();
  const { userIsMovingCurrentWorksheet, openStudents, currentWorksheet } = useSessionStateStore.getState()
  let student = allStudents[studentIDNumber]
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: constants.redColor,
    padding: "14px 14px",
    "--original-bg-color": constants.redColor,
    cursor: userIsMovingCurrentWorksheet ? "pointer" : "default"
  }

  const nameStyle = {
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "white",
    fontWeight: "normal",
    fontSize: "1em"
  }
  
  const studentColorIndicatorCircleStyle = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: constants.colorMap[student.color],
    marginRight: "10px"
  }
  
  const leftAlignedContainerStyle = {
    display: "flex",
    alignItems: "center"
  }
  
  const onCloseClick = () => {
    const { deleteOpenStudent } = useSessionStateStore.getState()
    deleteOpenStudent(studentIDNumber)
  }
  
  const moveWorksheetToThisStudent = function(){
    console.log(openStudents)
    const { thisStudentIndex } = getStudentFromOpenStudents(studentIDNumber)
    const { setOpenStudents, setCurrentWorksheet } = useSessionStateStore.getState()
    if(thisStudentIndex !== currentWorksheet.openStudentIndex){
      let newOpenStudents = [...openStudents]
      newOpenStudents[thisStudentIndex].openWorksheets.push( openStudents[currentWorksheet.openStudentIndex].openWorksheets[currentWorksheet.worksheetIndex] )
      openStudents[currentWorksheet.openStudentIndex].openWorksheets.splice(currentWorksheet.worksheetIndex, 1)
      setOpenStudents(newOpenStudents)
      setCurrentWorksheet(thisStudentIndex, newOpenStudents[thisStudentIndex].openWorksheets.length - 1)
    }
  }
  
  return (
    <div style={headerStyle}
    className={  userIsMovingCurrentWorksheet ? "pulsatingHeader" : null  }
    onClick = { userIsMovingCurrentWorksheet ? moveWorksheetToThisStudent : null }
    >
      <div style={leftAlignedContainerStyle}>
        <div style={studentColorIndicatorCircleStyle}></div>
        <h1 style={nameStyle}>{studentName} ID{studentIDNumber}</h1>
      </div>
      {
        userIsMovingCurrentWorksheet ? null : <CloseButton buttonWidthString="24px" iconWidthString="14px" color="white" onClickFunction={onCloseClick} />
      }
    </div>
  )
}

export default WorksheetViewer