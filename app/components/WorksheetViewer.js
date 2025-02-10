// import { colorMap, panelPadding, worksheetSelectionPanelWidth, getGenericButtonStyle } from "../constants.js"
import constants from "../constants.js"
import { useAllStudentsStore, useSessionStateStore } from "../page.js"

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
    padding: constants.panelPadding,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column"
  }
  return (
    <div style={pagePanelStyle}>
      <div style={{display:"flex", height:"0%", flexGrow: 1, backgroundColor:"lightblue"}}>
        <PageContainer isLeftOrRight="left" />
        <PageContainer isLeftOrRight="right" />
      </div>
      {/* <div style={{display:"flex", flexGrow: 1, flexDirection: "column", height:"100%"}}>
      </div> */}
      <PagePanelFooter />
    </div>
  )
}

function PagePanelFooter(){
  const pagePanelFooterStyle = {  padding: constants.panelPadding }
  const settingsButtonStyle = {
    padding: "5px",
    borderRadius: "50%",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "20px"
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
    pageContainerStyle.marginRight = constants.panelPadding;
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
    width: constants.worksheetSelectionPanelWidth,
    height: "100%",
    // backgroundColor: "lightblue",
    padding: constants.panelPadding,
    boxSizing: "border-box"
  }
  
  const openStudents = useSessionStateStore().openStudents;
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
    backgroundColor: constants.colorMap[student.color].light,
    padding: constants.panelPadding,
    boxSizing: "border-box",
    marginBottom: constants.panelPadding
  }
  return (
    <div style={studentSessionCardStyle}>
      <StudentSessionCardHeader studentName={student.name} studentIDNumber={studentIDNumber} />
    </div>
  )
}

function StudentSessionCardHeader({studentName, studentIDNumber}){
  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }

  const nameStyle = {
    margin: 0,
    fontSize: "medium",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }

  const buttonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "large",
    color: "black"
  }
  
  const onCloseClick = () => {
    const { deleteOpenStudent } = useSessionStateStore.getState()
    deleteOpenStudent(studentIDNumber)
  }

  return (
    <div style={headerStyle}>
      <h1 style={nameStyle}>{studentName} ID{studentIDNumber}</h1>
      <button style={buttonStyle} onClick={onCloseClick}>&times;</button>
    </div>
  )
}

export default WorksheetViewer