// import { colorMap, panelPadding, worksheetSelectionPanelWidth, getGenericButtonStyle } from "../constants.js"
import constants from "../constants.js"
import { useAllStudentsStore, useSessionStateStore } from "../page.js"
import { useStatusMessageStore, useAWorksheetProcessIsBusyStore } from "../stores.js"
import { setStatusMessageOfWorksheetProcess } from "./SettingsPage.js"
import { useEffect } from "react"
function WorksheetViewer(){
  const worksheetViewerStyle = {
    width: "100%",
    height: "100%",
    // backgroundColor: "lightgrey",
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
    boxSizing: "border-box"
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
    overflow: "hidden"
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
  return openStudents.filter( (student)=> student.studentIDNumber == studentIDNumber )[0]
}

function StudentSessionCardWorksheetList({ studentIDNumber }){
  const allStudents = useAllStudentsStore.getState().allStudents;
  const openStudents = useSessionStateStore().openStudents;
  
  const worksheetListStyle = {
    display: "flex",
    flexDirection: "column",
    padding: "14px 14px",
    overflowY: "auto",
    height: "100%"
  }
  
  const thisStudent = getStudentFromOpenStudents(studentIDNumber)
  return (
    <div style={worksheetListStyle}>
      {
        thisStudent.openWorksheets.map( (worksheetID) => {
          return <WorksheetListItem key={worksheetID} worksheetID={worksheetID}/>
        } )
      }
    </div>
  )
}

function WorksheetListItem({ worksheetID }){
  const worksheetListItemStyle = {
    fontFamily: "Roboto, sans-serif",
    fontWeight: "normal",
    fontSize: "14px",
    border: "none",
    backgroundColor: "white",
    padding: "10px",
    cursor: "pointer",
    textAlign: "left", // Align text to the left
    width: "100%", // Ensure the button takes full width
    borderRadius: "500px", // Make the button pill-shaped
  }
  return (
    <button style={worksheetListItemStyle}>
      { worksheetID }
    </button>
  )
}

function StudentSessionCardFooter({ studentIDNumber }){
  const footerStyle = {
    backgroundColor: "none",
    padding: "14px 14px",
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
      <img src="/icons/timer.svg" alt="Start timer" style={{ width: "23px", height: "23px" }} />
    </button>
  )
}

function AddWorksheetButton({ studentIDNumber, styleObject }){
  return (
    <button style={styleObject}>
      <img src="/icons/add.svg" alt="Add worksheet" style={{ width: "16px", height: "16px" }} />
    </button>
  )
}

function StudentSessionCardHeader({studentName, studentIDNumber}){
  const { allStudents } = useAllStudentsStore.getState();
  let student = allStudents[studentIDNumber]
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: constants.redColor,
    padding: "14px 14px"
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

  const buttonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "large",
    color: "white",
    width: "24px",
    height: "24px",
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
  
  
  const onCloseClick = () => {
    const { deleteOpenStudent } = useSessionStateStore.getState()
    deleteOpenStudent(studentIDNumber)
  }
  
  return (
    <div style={headerStyle}>
      <div style={leftAlignedContainerStyle}>
        <div style={studentColorIndicatorCircleStyle}></div>
        <h1 style={nameStyle}>{studentName} ID{studentIDNumber}</h1>
      </div>
      <button style={buttonStyle} onClick={onCloseClick}>
        <img src="/icons/close.svg" alt="Close" style={{ width: "14px", height: "14px" }} />
      </button>
    </div>
  )
}

export default WorksheetViewer