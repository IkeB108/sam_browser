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
  
  /*
  Notes for making a div with aspect-ratio fill a parent div:
  The solution used here, that works on all browsers (especially Safari) is here:
  https://blog.duvallj.pw/posts/2024-09-14-safari-css-bug.html#user-content-fn-1
  
  In the case of this app, the parent div to fill happens to be #wrapper-for-single-page (which happens to fill half of available space in this app) and the child div is <PageContainer /> (ignore #wrapper-for-both-pages for the purpose of these notes).
  
  Set parent div style to:
    position: relative;
  
  Set child div style to:
    position: absolute;
    inset: 0;
    max-height: 100%;     <-- Important
    aspect-ratio: x / y;
    margin: auto;      <-- For centering the child, but afaik not needed for making 
                           aspect ratio work correctly, even in Safari. In this app,
                           the margin-left is set to auto for <PageContainer />.
  
  The blog's theory for why this works is this:
  1. "position: absolute" and "inset: 0" sets the child container's width and height to match the parent (however, these don't affect the width and height properties directly. Both are still on "auto" so they can participate in aspect-ratio resolution)
  2. Next, the browser applies "aspect-ratio: x / y", defaulting to setting the height based on the width
  3. Next, the browser applies "max-height: 100%", clipping the height
  4. Finally, "aspect-ratio: x / y" is applied again, this time setting the width based on the height, because width is still "auto".
  
  The explanation continues:
  "
    This explanation checks out with all my previous ones: some sort of “auto-resolution loop” happens, and we never saw it because earlier, one of the width/height was non-auto. It also now makes sense why this works in all browsers, because the order of aspect-ratio/max-height no longer matters; aspect-ratio gets applied twice anyways.

    What margin: auto does then, is center the div in both axes (and in Safari’s case, make it so the vertical margin can no longer be negative, because of course Safari is still special). You can pin the container to a given side by setting margin-<side>: 0 afterwards.

    Phew!! Box sizing is hard, man.
  "
  
  
  */
  
  if(aWorksheetProcessIsBusy){
    wrapperForBothPages = (
      <div id="wrapper-for-both-pages" style={wrapperForBothPagesStyle}>
        <p>{statusMessage}</p>
      </div>
    )
  } else {
    if(pageView == "double"){
      const wrapperForLeftPageStyle = {
        position: "relative",
        width: "50%",
        marginRight: `${marginBetweenPages}px`,
        height: "100%",
      }
      
      const wrapperForRightPageStyle = {
        position: "relative",
        width: "50%",
        height: "100%",
      }
      
      wrapperForBothPages = (
        <div id="wrapper-for-both-pages" style = {wrapperForBothPagesStyle}>
          <div id="wrapper-for-single-page" style={wrapperForLeftPageStyle}>
            <PageContainer isLeftOrRight="left" />
          </div>
          <div id="wrapper-for-single-page" style={wrapperForRightPageStyle}>
            <PageContainer isLeftOrRight="right" />
          </div>
            
        </div>
      )
    }
    if(pageView == "single"){
      const wrapperForSinglePageStyle = {
        position: "relative",
        width: "100%",
        height: "100%",
      }
      
      wrapperForBothPages = (
        <div id="wrapper-for-both-pages" style = {wrapperForBothPagesStyle}>
          <div id="wrapper-for-single-page" style={wrapperForSinglePageStyle}>
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
    additionalStyleObject={
      {
        paddingLeft: "min(1.5vw, 24px)", 
        paddingRight: "min(1.5vw, 24px)",
        zIndex: "2" //Ensures that the button is clickable when it goes outside the bounds of its parent
      }
    }
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
    additionalStyleObject={
      {
        paddingLeft: "min(2vw, 30px)",
        paddingRight: "min(2vw, 30px)",
        zIndex: "2" //Ensures that the button is clickable when it goes outside the bounds of its parent
      }
    }
    onClickFunction={  ()=>{ changePage("prev") } }>
      <img src={constants.iconsFolderPath + "/arrow_left.svg"} alt="Previous Page" style={{width: "15px", height: "20px"}} />
  </GenericPillButton>
  
  const nextPageButton =
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={
      {
        paddingLeft: "min(2vw, 30px)",
        paddingRight: "min(2vw, 30px)",
        zIndex: "2" //Ensures that the button is clickable when it goes outside the bounds of its parent
      }   
    }
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
  const pageContainerStyle = {
    position: "absolute",
    inset: 0,
    marginLeft: "auto",
    maxHeight: "100%",
    aspectRatio: "496 / 702",
  }
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
  let student;
  if(studentIDNumber == "other"){
    student = {"name": "Other", "color": "none"}
  } else {
    student = allStudents[studentIDNumber]
  }
  const studentSessionCardStyle = {
    width: "100%",
    backgroundColor: "white",
    borderRadius: "12px",
    // border: `1px solid ${constants.softBorderColor}`,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.45)",
    boxSizing: "border-box",
    marginBottom: "12px",
    overflow: "hidden",
    position: "relative",
  }
  
  if(studentIDNumber == "other"){
    studentSessionCardStyle.border = "1px solid #eeeeee"
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
    padding: "10px 4px",
    overflowY: "auto",
    height: "100%"
  }
  
  if(studentIDNumber == "other"){
    worksheetListStyle.paddingTop = "0px"
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
    fontSize: "12px",
    border: "none",
    backgroundColor: "white",
    padding: "6px",
    cursor: isCurrentWorksheet ? "arrow" : "pointer",
    textAlign: "left", // Align text to the left
    width: "100%", // Ensure the button takes full width
    borderRadius: "12px", // Make the button pill-shaped
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
    flexShrink: 1,
    // textWrap: "balance"
  }
  
  const worksheetID_without_WS = worksheetID.slice(0, -3)
  
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
        <p style={worksheetNameParagraphStyle}>{ worksheetID_without_WS }</p>
        <div style={{display: "flex"}}>
          {/* <MoveWorksheetButton /> */}
          <CloseButton buttonWidthString="24px" iconWidthString="14px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{flexShrink: 0}} />
        </div>
      </div>
    )
  }
  return (
    <button style={worksheetListItemStyle} onClick={onClick}>
      { worksheetID_without_WS }
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
  const { userIsMovingCurrentWorksheet, setUserIsMovingCurrentWorksheet, setUserCanClickAnywhereToDisableMovingCurrentWorksheet, currentWorksheet } = useSessionStateStore.getState()
  const aWorksheetIsSelected = currentWorksheet.openStudentIndex !== null
  if(!aWorksheetIsSelected) return;
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
    useAddWorksheetModalIsOpenStore.getState().setStudentAddingFor(studentIDNumber)
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
      <p style={{margin: "0", padding: "0"}}>Add Students</p>
    </GenericPillButton>
  )
}

function StudentSessionCardHeader({studentName, studentIDNumber}){
  const { allStudents } = useAllStudentsStore.getState();
  const { userIsMovingCurrentWorksheet, openStudents, currentWorksheet } = useSessionStateStore.getState()
  let student;
  if(studentIDNumber == "other"){
    student = { "name": "Other", "color": "none" }
  } else {
    student = allStudents[studentIDNumber]
  }
  
  let headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: constants.redColor,
    padding: "6px 10px",
    "--original-bg-color": constants.redColor,
    "--pulsate-bg-color": "#eb9286",
    cursor: userIsMovingCurrentWorksheet ? "pointer" : "default",
  }

  let nameStyle = {
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "white",
    fontWeight: "normal",
    fontSize: "12px"
  }
  
  let studentColorIndicatorCircleStyle = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: constants.colorMap[student.color],
    marginRight: "10px"
  }
  
  if(studentIDNumber == "other"){
    studentColorIndicatorCircleStyle.backgroundColor = "#00000000"
    headerStyle.backgroundColor = "white"
    headerStyle.justifyContent = "center"
    headerStyle.padding = "10px 0px"
    headerStyle["--original-bg-color"] = "rgb(223, 223, 223)"
    headerStyle["--pulsate-bg-color"] = "white"
    nameStyle.color = "black"
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
  
  // const useCloseButton = (!userIsMovingCurrentWorksheet && studentIDNumber !== "other")
  // const emptyDivToReplaceCloseButton = (
  //   <div style={{width: "24px", height: "24px"}}></div>
  // )
  let closeButtonOrSubstitute = <CloseButton buttonWidthString="24px" iconWidthString="14px" color="white" onClickFunction={onCloseClick} />
  if(userIsMovingCurrentWorksheet){
    closeButtonOrSubstitute = <div style={{width: "24px", height: "24px"}}></div>
  }
  if(studentIDNumber == "other"){
    closeButtonOrSubstitute = null
  }
  return (
    <div style={headerStyle}
    className={  userIsMovingCurrentWorksheet ? "pulsatingHeader" : null  }
    onClick = { userIsMovingCurrentWorksheet ? moveWorksheetToThisStudent : null }
    >
      <div style={leftAlignedContainerStyle}>
        { (studentIDNumber == "other") ? null : <div style={studentColorIndicatorCircleStyle}></div>}
        <h1 style={nameStyle}>{studentName}</h1>
      </div>
      {
        closeButtonOrSubstitute
      }
    </div>
  )
}

export default WorksheetViewer