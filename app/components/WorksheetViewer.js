import { colorMap, panelPadding, worksheetSelectionPanelWidth } from "../constants.js"
import { useAllStudentsStore, useSessionStateStore, getSortedStudentsInSessionState } from "../page.js"

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
    // backgroundColor: "lightgreen",
    position: "relative"
  }
  if(isLeftOrRight == 'left'){
    pageContainerStyle.marginRight = panelPadding;
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
    // backgroundColor: "lightblue",
    padding: panelPadding,
    boxSizing: "border-box"
  }
  
  const openStudents = useSessionStateStore().openStudents;
  const sortedStudents = getSortedStudentsInSessionState(openStudents)
  return (
    <div style={worksheetSelectionPanelStyle}>
      {
        sortedStudents.map( (studentIDNumber)=>{
          return <StudentSessionCard key={studentIDNumber} studentIDNumber={studentIDNumber} />
        })
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
    backgroundColor: colorMap[student.color].light,
    padding: panelPadding,
    boxSizing: "border-box",
    marginBottom: panelPadding
  }
  return (
    <div style={studentSessionCardStyle}>
      <StudentSessionCardHeader studentName={student.name} studentPos={openStudents[studentIDNumber].positionInWorksheetSelectionPanel} studentIDNumber={studentIDNumber} />
    </div>
  )
}

function StudentSessionCardHeader({studentName, studentPos, studentIDNumber}){
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
    fontSize: "large"
  }
  
  const onCloseClick = () => {
    const { deleteOpenStudent } = useSessionStateStore.getState()
    deleteOpenStudent(studentIDNumber)
  }

  return (
    <div style={headerStyle}>
      <h1 style={nameStyle}>{studentName} Pos{studentPos} ID{studentIDNumber}</h1>
      <button style={buttonStyle} onClick={onCloseClick}>&times;</button>
    </div>
  )
}

export default WorksheetViewer