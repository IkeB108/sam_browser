import constants from "../constants.js"
import { create } from "zustand"
import { CloseButton, GenericPillButton } from "../constants.js"
import { useAllStudentsStore, useSessionStateStore, useUserSettingsStore, worksheets } from "../page.js"
import { useStatusMessageStore, useAWorksheetProcessIsBusyStore, useAddWorksheetModalIsOpenStore } from "../stores.js"
import { AddWorksheetModal } from "./AddWorksheetModal.js"

import { useEffect } from "react"

const pagesAreHiddenStore = create( (set) => ({
  pagesAreHidden: false,
  setPagesAreHidden: (pagesAreHidden) => set({ pagesAreHidden })
}) )

function WorksheetViewer(){
  useEffect( ()=> {
    window.useAddWorksheetModalIsOpenStore = useAddWorksheetModalIsOpenStore
  }, [])
  const { addWorksheetModalIsOpen } = useAddWorksheetModalIsOpenStore()
  const worksheetViewerStyle = {
    width: "100%",
    height: "100%",
    // backgroundColor: userHasPinchZoomed ? "green": "red",
    display: "flex",
    flexShrink: 0,
    containerType: "size"
  }
  
  
  return (
    <div style={worksheetViewerStyle}>
      <PagePanel />
      <WorksheetSelectionPanel />
      {
        addWorksheetModalIsOpen ? <AddWorksheetModal /> : null
      }
    </div>
  )
}

function PagePanel(){
  const pagePanelStyle = {
    flexGrow: 1,
    flexBasis: "0%",
    height: "100%",
    // backgroundColor: "lightgrey",
    padding: "16px",
    paddingRight: "8px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    containerType: "size"
  }
  
  const aWorksheetProcessIsBusy = useAWorksheetProcessIsBusyStore().aWorksheetProcessIsBusy
  const statusMessage = useStatusMessageStore().statusMessage
  const { pageView } = useUserSettingsStore()
  
  const marginBetweenPages = 16
  
  let wrapperForBothPages = null
  const wrapperForBothPagesStyle = {
    width: "100%",
    height: "100%",
    containerType: "size",
    boxSizing: "border-box",
    display: "flex"
  }
  if(aWorksheetProcessIsBusy){
    wrapperForBothPages = (
      <div id="wrapper-for-both-pages" style={wrapperForBothPagesStyle}>
        <p>{statusMessage}</p>
      </div>
    )
  } else {
    if(pageView == "double"){
      /* 
        Notes about using css aspect-ratio property on a child div:
        
        Typically, you can make a child div with a fixed aspect ratio fill its parent div without overflowing by setting its style like this:
          aspect-ratio: x / y;
          max-width: 100%;
          max-height: 100%;   (setting width & height is not needed)
                              (With these settings, child-div will either be 100% width of parent-div or 100% height depending on parent-div's aspect ratio, which is what you want)
        Often, this is enough, but sometimes, this can cause the child-div to expand the parent-div, overriding the parent-div's width & height attributes.
        To fix this, set the parent-div's container-type to "size". This means the parent-div's size will be calculated completely independently of its children, i.e. it will ignore its childrens' sizes no matter what. Container-type is usually meant to be used for container queries, but it can have affects outside of container queries as well, as in this case.
        If this ever still doesn't work, investigate using cqw and cqh (container query units).
      */
      wrapperForBothPages = (
        <div id="wrapper-for-both-pages" style = {wrapperForBothPagesStyle}>
          
          <div id="wrapper-for-left-page" style={{width: "50%", height: "100%", marginRight: marginBetweenPages}}>
            {/* PageContainer is the element that has an aspect-ratio property */}
            <PageContainer isLeftOrRight="left" />
          </div>
          <div id="wrapper-for-right-page" style={{width: "50%", height: "100%"}}>
            <PageContainer isLeftOrRight="right" />
          </div>
          
        </div>
      ) 
    }
    if(pageView == "single"){
      wrapperForBothPages = (
        <div id="wrapper-for-both-pages" style = {wrapperForBothPagesStyle}>
          <div id="wrapper-for-single-page" style={{width: "100%", height: "100%"}}>
            <PageContainer isLeftOrRight="left" />
          </div>
        </div>
      )
    }
  }
  
  return (
    <div style={pagePanelStyle}>
      { wrapperForBothPages }
      <PagePanelFooter />
    </div>
  )
}

function PagePanelFooter(){
  const pagePanelFooterStyle = {
    paddingTop: "16px",
    // border: "1px solid blue",
    display: "flex",
    gap: "8px",
    justifyContent: "space-between"
  }
  
  const togglePageView = function(){
    const { pageView, setPageView } = useUserSettingsStore.getState()
    const newVal = pageView == "double" ? "single" : "double"
    setPageView( newVal )
    const { currentPageOfWorksheet, setCurrentPageOfWorksheet } = useSessionStateStore.getState()
    let newCurrentPage = currentPageOfWorksheet
    if(newVal == "single"){
      if(newCurrentPage == 0)newCurrentPage = 1
    }
    if(newVal == "double"){
      if(newCurrentPage % 2 == 1)newCurrentPage --
    }
    setCurrentPageOfWorksheet( newCurrentPage )
  }
  const { pageView } = useUserSettingsStore()
  const togglePageViewIconPath = constants.iconsFolderPath + (( pageView == "single") ? "/single_page_view.svg" : "/two_page_view.svg")
  const togglePageViewButton = //toggles whether to display a single page or two pages
  <GenericPillButton
    isFilled={true}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 24px)", paddingRight: "min(1.5vw, 24px)", minWidth: "45px"}}
    onClickFunction={ togglePageView }>
      <img src={togglePageViewIconPath} alt="Toggle Page View"/>
  </GenericPillButton>
  
  const moveButton = 
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 24px)", paddingRight: "min(1.5vw, 24px)"}}
    onClickFunction={ onMoveWorksheetClick }>
      <p style={{margin: "0", padding: "0", marginRight: "10px", fontSize: "min(1.6vw, 16px)", textWrap: "nowrap"}}>Move</p>
      <img src={constants.iconsFolderPath + "/move.svg"} alt="Move" style={{ width: "19px", height: "15px" }}/>
  </GenericPillButton>
  
  const logWorksheetButton = 
  <GenericPillButton
    isFilled={true}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 24px)", paddingRight: "min(1.5vw, 24px)"}}
    onClickFunction={ ()=>{console.log("log worksheet button clicked")} }>
      <p style={{margin: "0", padding: "0", marginRight: "14px", fontSize: "min(1.6vw, 16px)", textWrap: "nowrap"}}>Log worksheet</p>
      <img src={constants.iconsFolderPath + "/arrow_up.svg"} alt="Expand" style={{ width: "14px", height: "7px" }}/>
  </GenericPillButton>
  
  const togglePageVisibility = function(){
    const { pagesAreHidden, setPagesAreHidden } = pagesAreHiddenStore.getState()
    setPagesAreHidden( !pagesAreHidden )
  }
  const { pagesAreHidden } = pagesAreHiddenStore()
  const togglePageVisibilityButton =
  <GenericPillButton
    isFilled={true}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(2vw, 30px)", paddingRight: "min(2vw, 30px)"}}
    onClickFunction={ togglePageVisibility }>
      {
        pagesAreHidden ?
          <img id="toggle-hidden" src={constants.iconsFolderPath + "/hidden.svg"} alt="Toggle visibility" /> :
          <img id="toggle-visible" src={constants.iconsFolderPath + "/visible.svg"} alt="Toggle visibility" />
      }
  </GenericPillButton>
  
  const changePage = function( prevOrNext ){
    const { currentPageOfWorksheet, setCurrentPageOfWorksheet, getCurrentWorksheetID } = useSessionStateStore.getState()
    if(getCurrentWorksheetID() == null) return;
    
    const { pageView } = useUserSettingsStore.getState()
    const pagesToAdvance = (pageView == "single") ? 1 : 2
    let currentWorksheet = getCurrentWorksheetID()
    let newPage = currentPageOfWorksheet
    if(prevOrNext == "prev") newPage -= pagesToAdvance
    if(prevOrNext == "next") newPage += pagesToAdvance
    let minPage = (pageView == "single") ? 1 : 0
    let maxPage = worksheets[currentWorksheet].pageCount
    if(pageView == "double"){
      if(maxPage % 2 == 1) maxPage -= 1 //In double view, if the pagecount is an odd number, set max page to one less than the page count
    }
    if(newPage < minPage) newPage = minPage
    if(newPage > maxPage) newPage = maxPage
    setCurrentPageOfWorksheet( newPage )
  }
  const prevPageButton =
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(2vw, 30px)", paddingRight: "min(2vw, 30px)"}}
    onClickFunction={  ()=>{ changePage("prev") } }>
      <img src={constants.iconsFolderPath + "/arrow_left.svg"} alt="Previous Page" style={{width: "15px", height: "20px"}} />
  </GenericPillButton>
  
  const nextPageButton =
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(2vw, 30px)", paddingRight: "min(2vw, 30px)"}}
    onClickFunction={  ()=>{ changePage("next") } }>
      <img src={constants.iconsFolderPath + "/arrow_right.svg"} alt="Next Page" style={{width: "15px", height: "20px"}} />
  </GenericPillButton>
  
  const footerSegmentStyle = {
    display: "flex",
    gap: "8px",
  }
  return (
    <div style={pagePanelFooterStyle}>
      <div style={footerSegmentStyle}>
        { togglePageViewButton }
        { togglePageVisibilityButton }
        { moveButton }
        { logWorksheetButton }
      </div>
      <div style={footerSegmentStyle}>
        { prevPageButton }
        { nextPageButton }
      </div>
    </div>
  )
}

function PageContainer( {isLeftOrRight} ){
  // This container will be the exact same size as the page image
  const { currentPageOfWorksheet, getCurrentWorksheetID } = useSessionStateStore()
  const pageNumber = isLeftOrRight == "left" ? currentPageOfWorksheet : currentPageOfWorksheet + 1
  let pageImageBlob = null
  const currentWorksheetID = getCurrentWorksheetID()
  if(currentWorksheetID){
    //The user has selected a worksheet from the worksheet selection panel
    if(!worksheets[currentWorksheetID]){
      //The user has selected a worksheet that they've not yet downloaded to their system
      pageImageBlob = "worksheet_not_available"
    }
    else if(worksheets[currentWorksheetID].pageBlobs[pageNumber]){
      //The user has selected a worksheet that is downloaded, and a page of pageNumber exists for this worksheet
      pageImageBlob = worksheets[currentWorksheetID].pageBlobs[pageNumber]
    } 
  }
  const pageContainerStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    // display: (pageImageBlob === null) ? "none" : "block",
    aspectRatio: "496 / 702",
    position: "relative",
    marginLeft: "auto",
  }
  return (
    <div style={pageContainerStyle}>
        {/* <PageImage imageSrc="placeholderWorksheetPage.webp" /> */}
        <PageImage pageImageBlob={pageImageBlob} />
        {/* <ChangePageButton isLeftOrRight={isLeftOrRight} /> */}
        <PageNumberIndicator isLeftOrRight={isLeftOrRight} pageNumber={pageNumber} pageExists={pageImageBlob === null} />
    </div>
  )
}

function PageNumberIndicator({isLeftOrRight, pageNumber, pageExists}){
  const pageNumberIndicatorStyle = {
    position: "absolute",
    bottom: "15px",
    width: "44px",
    height: "44px",
    backgroundColor: "white",
    borderRadius: "4px",
    border: "1px solid #3D3D3D",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "18px",
    display: pageExists ? "none" : "flex"
  }
  pageNumberIndicatorStyle[isLeftOrRight] = "15px"
  return (
    <div style={pageNumberIndicatorStyle}>
      {pageNumber}
    </div>
  )
}

function PageImage({ pageImageBlob }){
  const pageImageStyle = {
    width: "100%",
    height: "100%",
    border: "1px solid #A9A09E",
    borderRadius: "12px",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    boxSizing: "border-box"
  }
  const { pagesAreHidden } = pagesAreHiddenStore()
  const hasNoPage = (pageImageBlob === null) || pagesAreHidden
  if(hasNoPage){
    return (
      <div style={pageImageStyle}>
      </div>
    )
  }
  if(pageImageBlob === "worksheet_not_available"){
    return (
      <div style={pageImageStyle}>
        <p style={{fontSize: "14px",textWrap: "balance",textAlign: "center"}}>Error</p>
        <p style={{fontSize: "14px",textWrap: "balance",textAlign: "center"}}>It appears this worksheet is not downloaded to your system.</p>
      </div>
    )
  }
  const fileURL = URL.createObjectURL(pageImageBlob)
  return (
    <img src={fileURL} style={pageImageStyle} />
  )
}

function WorksheetSelectionPanel(){
  const worksheetSelectionPanelStyle = {
    width: constants.worksheetSelectionPanelWidth,
    height: "100%",
    // backgroundColor: "lightblue",
    padding: "16px",
    paddingLeft: "8px",
    boxSizing: "border-box",
    overflowY: "scroll",
    containerType: "size"
  }
  
  const openStudents = useSessionStateStore().openStudents;
  useEffect( ()=> {
    window.openStudents = openStudents
  }, [])
  return (
    <div style={{
        height: "100%",
        flexGrow: 0,
        flexBasis: "0%",
        display: "flex",
        flexDirection: "column"
      }}>
      <div style={worksheetSelectionPanelStyle}>
        {
          openStudents.map( (studentData, index) => {
            return <StudentSessionCard key={studentData.studentIDNumber} studentIDNumber={studentData.studentIDNumber} />
          } )
        }
        <AddStudentButton />
      </div>
      <WorksheetSelectionPanelFooter />
    </div>
  )
}

function WorksheetSelectionPanelFooter(){
  const worksheetSelectionPanelFooterStyle = {
    paddingTop: "16px",
    // border: "1px solid blue",
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    // width: "100%"
    marginBottom: "16px",
    marginRight: "16px",
    borderTop: "1px solid #A9A09E",
    // borderLeft: "none",
    // borderRight: "none",
    // borderBottom: "none"
  }
  const viewLogButton = 
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 24px)", paddingRight: "min(1.5vw, 24px)"}}
    onClickFunction={ ()=>{console.log("view log button clicked")} }>
      <p style={{margin: "0", padding: "0", fontSize: "min(1.6vw, 16px)", textWrap: "nowrap"}}>View log</p>
  </GenericPillButton>
  
  const settingsButton =
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 30px)", paddingRight: "min(1.5vw, 30px)"}}
    onClickFunction={ ()=>{ useSessionStateStore.getState().setCurrentPage("SettingsPage") } }>
      <img src={constants.iconsFolderPath + "/settings.svg"} alt="Settings" style={{ width: "23px", height: "23px" }}/>
  </GenericPillButton>
  
  return (
    <div style={worksheetSelectionPanelFooterStyle}>
      { viewLogButton }
      { settingsButton }
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
    position: "relative",
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
    const worksheetID = thisStudent.openWorksheets[i].id
    const isCurrentWorksheet = currentWorksheet.openStudentIndex == thisStudentIndex && currentWorksheet.worksheetIndex == i
    
    const onClick = function(){
      const { setCurrentWorksheet, setUserIsMovingCurrentWorksheet, setCurrentPageOfWorksheet, openStudents } = useSessionStateStore.getState()
      const { pageView } = useUserSettingsStore.getState()
      setCurrentWorksheet(thisStudentIndex, i)
      setUserIsMovingCurrentWorksheet(false)
      
      let newCurrentPage = openStudents[thisStudentIndex].openWorksheets[i].pageLeftOff
      if(pageView == "single"){
        if(newCurrentPage == 0)newCurrentPage = 1
      }
      if(pageView == "double"){
        if(newCurrentPage % 2 == 1)newCurrentPage --
      }
      setCurrentPageOfWorksheet(newCurrentPage)
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
    color: "inherit",
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
  return (
    <button style={moveWorksheetButtonStyle} onClick={ onMoveWorksheetClick }>
      <img src={`${constants.iconsFolderPath}/move.svg`} alt="Move Worksheet" style={{ width: "20px", height: "16px" }} />
    </button>
  )
  
}

function onMoveWorksheetClick(){
  //Toggle whether user is moving a worksheet
  const { userIsMovingCurrentWorksheet, setUserIsMovingCurrentWorksheet, setUserCanClickAnywhereToDisableMovingCurrentWorksheet } = useSessionStateStore.getState()
  if(!userIsMovingCurrentWorksheet){
    setUserCanClickAnywhereToDisableMovingCurrentWorksheet(true)
  }
  setUserIsMovingCurrentWorksheet( !userIsMovingCurrentWorksheet )
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
  const onClick = function(){
    useAddWorksheetModalIsOpenStore.getState().setAddWorksheetModalIsOpen(true)
    console.log("Add worksheet for " + studentIDNumber)
  }
  return (
    <button style={styleObject} onClick={onClick}>
      <img src={constants.iconsFolderPath + "/add_black.svg"} alt="Add worksheet" style={{ width: "16px", height: "16px" }}/>
    </button>
  )
}

function AddStudentButton(){
  return (
    <GenericPillButton isFilled={true} isShort={true} onClickFunction={()=>{console.log("Add student")}} additionalStyleObject={{margin: "0 auto", paddingLeft: "30px", paddingRight: "30px"}} >
      <img src={constants.iconsFolderPath + "/add_white.svg"} alt="Add student" style={{ width: "12px", height: "12px", marginRight: "8px" }}/>
      <p style={{margin: "0", padding: "0"}}>Add Student</p>
    </GenericPillButton>
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
        <h1 style={nameStyle}>{studentName}</h1>
      </div>
      {
        userIsMovingCurrentWorksheet ? null : <CloseButton buttonWidthString="24px" iconWidthString="14px" color="white" onClickFunction={onCloseClick} />
      }
    </div>
  )
}

export default WorksheetViewer