import constants from "../constants.js"
import { create } from "zustand"
import { CloseButton, GenericPillButton } from "../constants.js"
import { useSessionStateStore, useUserSettingsStore } from "../page.js"
import { worksheets, retrieveWorksheet } from "../retrieveWorksheet.js"
import { useUserJustClickedMoveStore, useStatusMessageStore, useAWorksheetProcessIsBusyStore, useAddWorksheetModalIsOpenStore, useUserHasPinchZoomedStore } from "../stores.js"
import { AddWorksheetModal } from "./AddWorksheetModal.js"
import { useEffect, useRef } from "react"

const useIsFullscreenStore = create( (set) => ({ isFullscreen: false }))

const pagesAreHiddenStore = create( (set) => ({
  pagesAreHidden: false,
  setPagesAreHidden: (pagesAreHidden) => set({ pagesAreHidden })
}) )

const usePageDraggingStore = create( (set) => ({
  userIsDraggingPages: false,
  touchStartX: null,
  currentPageOnTouchStart: null,
  currentGestureIncludesMultitouch: false
}))

export const useTimeOfLastWorksheetAddStore = create( (set) => ({
  timeOfLastWorksheetAdd: null,
})) //This value is purely for triggering rerenders of the pageContainer when new worksheets are loaded in

const dragToChangeCurrentPageIsAllowed = function(){
  const { userHasPinchZoomed } = useUserHasPinchZoomedStore.getState()
  const { pagesAreHidden } = pagesAreHiddenStore.getState()
  const { currentWorksheet } = useSessionStateStore.getState()
  const { currentGestureIncludesMultitouch } = usePageDraggingStore.getState()
  return !userHasPinchZoomed && !pagesAreHidden && (currentWorksheet.worksheetIndex != null) && !currentGestureIncludesMultitouch
}

function onKeyDownInWorksheetViewer(event){
  const { allowArrowKeysForPageNavigation } = useSessionStateStore.getState()
  if(allowArrowKeysForPageNavigation){
    if(event.key == "ArrowLeft"){
      changePage("prev")
    }
    if(event.key == "ArrowRight"){
      changePage("next")
    }
  }
  
}

function onPageContainerPointerDown(event){
  const pageChangeAllowed = dragToChangeCurrentPageIsAllowed()
  if(!pageChangeAllowed) return;
  
  event.preventDefault()
  
  const eventX = event.touches ? event.touches[0].clientX : event.clientX
  usePageDraggingStore.setState({
    userIsDraggingPages: true,
    currentPageOnTouchStart: useSessionStateStore.getState().currentPageOfWorksheet,
    touchStartX: eventX
  })
  
}

function onDocumentTouchStart(event){
  if(event.touches.length > 1){
    //If the current gesture involves multiple fingers, even if only for a moment,
    //then assume that zooming has been involved and do not allow page dragging
    //until all fingers have been released from the screen.
    usePageDraggingStore.setState({ currentGestureIncludesMultitouch: true })
  }
}

function onDocumentTouchEnd(event){
  if(event.touches.length == 0){
    usePageDraggingStore.setState({ currentGestureIncludesMultitouch: false })
  }
}

function onDocumentPointerMove(event){
  const dragDistanceOfOneIncrement = 60 //px
  const { userIsDraggingPages, touchStartX, currentPageOnTouchStart } = usePageDraggingStore.getState()
  if(!userIsDraggingPages || !dragToChangeCurrentPageIsAllowed()) return;
  
  const { setCurrentPageOfWorksheet, getCurrentWorksheetID } = useSessionStateStore.getState()
  const currentWorksheetID = getCurrentWorksheetID()
  if(worksheets[currentWorksheetID] === undefined) return; //User doesn't have this worksheet on their system
  
  event.preventDefault()
  const eventX = event.touches ? event.touches[0].clientX : event.clientX
  const touchEndX = eventX
  const diff = touchEndX - touchStartX
  let increment = Math.round( diff / dragDistanceOfOneIncrement ) * -1 //Negative because controls are flipped to simulate panning
  
  //Attempt to increment page number by increment
  const { pageView } = useUserSettingsStore.getState()
  if(pageView == "double"){
    increment *= 2
  }
  let newPage = currentPageOnTouchStart + increment
  let minPage = (pageView == "single") ? 1 : 0
  let maxPage = worksheets[ getCurrentWorksheetID() ].pageCount
  
  
  if(pageView == "double"){
    if(maxPage % 2 == 1) maxPage -= 1 //In double view, if the pagecount is an odd number, set max page to one less than the page count
  }
  if(newPage < minPage) newPage = minPage
  if(newPage > maxPage) newPage = maxPage
  
  //Update currentPageOfWorksheet to newPage, but only if it's changed
  const { currentPageOfWorksheet } = useSessionStateStore.getState()
  if(newPage !== currentPageOfWorksheet){
    setCurrentPageOfWorksheet( newPage )
  }
}

function onDocumentPointerUp(event){
  const { userIsDraggingPages, currentGestureIncludesMultitouch } = usePageDraggingStore.getState()
  if(userIsDraggingPages && !currentGestureIncludesMultitouch){
    event.preventDefault()
    
    //preventDefault() prevents textareas from unfocusing so we need
    //to manually unfocus them (blur them).
    //This could just as well be in a pointer down listener
    document.getElementById("notes-about-worksheet-text-area").blur()
    const notesElements = document.getElementsByClassName("notes-text-area")
    for(let i = 0; i < notesElements.length; i++){
      notesElements[i].blur()
    }
    
    usePageDraggingStore.setState({
      userIsDraggingPages: false,
      currentPageOnTouchStart: null,
      touchStartX: null,
      currentGestureIncludesMultitouch: false
    })
  }
}

function enableFullscreen(){
  document.body.requestFullscreen()
  useIsFullscreenStore.setState({ isFullscreen: true })
}

function disableFullscreen(){
  document.exitFullscreen()
  useIsFullscreenStore.setState({ isFullscreen: false })
}

function WorksheetViewer(){
  useEffect( ()=> {
    //for debugging in console
    window.useAddWorksheetModalIsOpenStore = useAddWorksheetModalIsOpenStore
    window.usePageDraggingStore = usePageDraggingStore
    window.enableFullscreen = enableFullscreen
    window.disableFullscreen = disableFullscreen
    window.condenseWorksheetString = condenseWorksheetString
    
    //Add keydown listener for left and right arrowkeys
    document.addEventListener("keydown", onKeyDownInWorksheetViewer)
    //Add touchstart & touchend event listener (for detecting multitouch only)
    document.addEventListener("touchstart", onDocumentTouchStart)
    document.addEventListener("touchend", onDocumentTouchEnd)
    //Add pointermove event listeners
    document.addEventListener("pointermove", onDocumentPointerMove)
    //Add pointerup event listeners
    document.addEventListener("pointerup", onDocumentPointerUp)
    
    useSessionStateStore.getState().loadFromLocalStorage()
    
    return () => {
      //Remove keydown listener for left and right arrowkeys
      document.removeEventListener("keydown", onKeyDownInWorksheetViewer)
      //Add touchstart & touchend event listener (for detecting multitouch only)
      document.removeEventListener("touchstart", onDocumentTouchStart)
      document.removeEventListener("touchend", onDocumentTouchEnd)
      //Remove pointermove event listeners
      document.removeEventListener("pointermove", onDocumentPointerMove)
      //Remove pointerup event listeners
      document.removeEventListener("pointerup", onDocumentPointerUp)
    }
  }, [])
  const { addWorksheetModalIsOpen } = useAddWorksheetModalIsOpenStore()
  const userIsDraggingPages = usePageDraggingStore( (state) => state.userIsDraggingPages )
  const madisonModeActive = useUserSettingsStore( (state) => state.madisonMode )
  
  //For debugging: Color background according to page drag state
  //Decide whether dragging to change page is allowed to determine cursor style
  //We won't use dragToChangeCurrentPageIsAllowed because we need all the hooks to be in the body of the component
  // const userHasPinchZoomed = useUserHasPinchZoomedStore( (state) => state.userHasPinchZoomed )
  // const pagesAreHidden = pagesAreHiddenStore( (state) => state.pagesAreHidden )
  // const currentWorksheet = useSessionStateStore( (state) => state.currentWorksheet )
  // const currentGestureIncludesMultitouch = usePageDraggingStore( (state) => state.currentGestureIncludesMultitouch )
  // const allowDragPages = !userHasPinchZoomed && !pagesAreHidden && (currentWorksheet.worksheetIndex != null) && !currentGestureIncludesMultitouch
  
  const worksheetViewerStyle = {
    width: "100%",
    height: "100%",
    // backgroundColor: userHasPinchZoomed ? "green": "red",
    display: "flex",
    flexShrink: 0,
    containerType: "size",
    cursor: userIsDraggingPages ? "ew-resize" : "default",
    backgroundColor: madisonModeActive ? "#ffc6f3" : "white"
    // backgroundColor: currentGestureIncludesMultitouch ? "blue" : ( allowDragPages ? "white" : "gray" )
  }
  
  
  return (
    <div style={worksheetViewerStyle} id="worksheetViewerDiv">
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
    display: "flex",
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
        <p style={{height: "30px"}}>{statusMessage}</p>
      </div>
    )
  } else {
    if(pageView == "double"){
      const wrapperForLeftPageStyle = {
        position: "relative",
        width: "50%",
        // marginRight: `${marginBetweenPages}px`,
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

function changePage( prevOrNext ){
  const { currentPageOfWorksheet, setCurrentPageOfWorksheet, getCurrentWorksheetID } = useSessionStateStore.getState()
  if(getCurrentWorksheetID() == null) return;
  
  const { pageView } = useUserSettingsStore.getState()
  const pagesToAdvance = (pageView == "single") ? 1 : 2
  let currentWorksheet = getCurrentWorksheetID()
  
  if(worksheets[currentWorksheet] === undefined) return; //User doesn't have this worksheet on their system
  
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

function PagePanelFooter(){
  
  const { isFullscreen } = useIsFullscreenStore()
  
  const pagePanelFooterStyle = {
    paddingTop: "16px",
    // border: "1px solid blue",
    display: "flex",
    // gap: "8px",
    // justifyContent: "space-between"
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
    functionToTrigger={ togglePageView }>
      <img src={togglePageViewIconPath} alt="Toggle Page View"/>
  </GenericPillButton>
  
  const moveButton = 
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 24px)", paddingRight: "min(1.5vw, 24px)"}}
    functionToTrigger={ onMoveWorksheetClick }
    useOnClick={true}>
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
    functionToTrigger={ ()=>{console.log("log worksheet button clicked")} }>
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
    functionToTrigger={ togglePageVisibility }>
      {
        pagesAreHidden ?
          <img id="toggle-hidden" src={constants.iconsFolderPath + "/hidden.svg"} alt="Toggle visibility" /> :
          <img id="toggle-visible" src={constants.iconsFolderPath + "/visible.svg"} alt="Toggle visibility" />
      }
  </GenericPillButton>
  
  const toggleFullscreenButton =
  <GenericPillButton
    isFilled={true}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(2vw, 30px)", paddingRight: "min(2vw, 30px)"}}
    functionToTrigger={ () => {
        if(document.fullscreenElement){
          disableFullscreen()
        } else {
          enableFullscreen()
        }
      }
    }>
      {
        isFullscreen ?
          <img src={constants.iconsFolderPath + "/fullscreen_exit.svg"} alt="Toggle Fullscreen" /> :
          <img src={constants.iconsFolderPath + "/fullscreen.svg"} alt="Toggle Fullscreen" />
      }
  </GenericPillButton>
  
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
    functionToTrigger={  ()=>{ changePage("prev") } }>
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
    functionToTrigger={  ()=>{ changePage("next") } }>
      <img src={constants.iconsFolderPath + "/arrow_right.svg"} alt="Next Page" style={{width: "15px", height: "20px"}} />
  </GenericPillButton>
  
  const footerSegmentStyle = {
    display: "flex",
    gap: "8px",
    flexGrow: 1,
    marginRight: "8px"
  }
  return (
    <div style={pagePanelFooterStyle}>
      <div style={footerSegmentStyle}>
        { toggleFullscreenButton }
        { togglePageViewButton }
        { togglePageVisibilityButton }
        { moveButton }
        { (typeof currentWorksheetID == null) ? null : <NotesAboutWorksheetTextArea /> }
      </div>
      <div style={{display: "flex", gap: "8px"}}>
        { prevPageButton }
        { nextPageButton }
      </div>
    </div>
  )
}

function NotesAboutWorksheetTextArea(){
  //Get current worksheet ID
  const currentWorksheet = useSessionStateStore( (state) => state.currentWorksheet )
  const openStudents = useSessionStateStore( (state) => state.openStudents )
  const getCurrentWorksheetID = useSessionStateStore( (state) => state.getCurrentWorksheetID )
  const currentWorksheetID = getCurrentWorksheetID()
  if(currentWorksheetID == null)return null;
  let currentWorksheetNotes = openStudents[ currentWorksheet.openStudentIndex ].openWorksheets[ currentWorksheet.worksheetIndex ].notes
  
  function onChange(event){
    const openStudentsCopy = [...openStudents]
    openStudentsCopy[ currentWorksheet.openStudentIndex ].openWorksheets[ currentWorksheet.worksheetIndex ].notes = event.target.value
    useSessionStateStore.getState().setOpenStudents( openStudentsCopy )
  }
  
  function onKeyDown(event){
    if(event.key == "Enter" ){
      document.getElementById("notes-about-worksheet-text-area").blur()
    }
  }
  
  
  return (<input type="text" 
    style={{
      width: "100%",
      maxWidth: "500px",
      height: "100%",
      border: "1px solid #A9A09E",
      borderRadius: "8px",
      boxSizing: "border-box",
      resize: "none",
      fontSize: "12px",
      fontFamily: "Roboto, sans-serif",
      padding: "12px"
    }}
    placeholder={`Notes for ${currentWorksheetID}...`}
    value={ currentWorksheetNotes }
    onChange = { onChange }
    onKeyDown = { onKeyDown }
    id="notes-about-worksheet-text-area"
    autoComplete="off"
  ></input>)
}

function PageContainer( {isLeftOrRight} ){
  
  useTimeOfLastWorksheetAddStore() //Purely for triggering rerenders when new worksheet images are loaded in
  
  const pageContainerRef = useRef(null)
  useEffect( ()=> {
    pageContainerRef.current.addEventListener("pointerdown", onPageContainerPointerDown)
    return () => {
      if(pageContainerRef.current){
        //If pageContainerRef.current is not null
        pageContainerRef.current.removeEventListener("pointerdown", onPageContainerPointerDown)
      }
    }
  }, [])
  
  
  
  //Decide whether dragging to change page is allowed to determine cursor style
  //We won't use dragToChangeCurrentPageIsAllowed because we need all the hooks to be in the body of the component
  const userHasPinchZoomed = useUserHasPinchZoomedStore( (state) => state.userHasPinchZoomed )
  const pagesAreHidden = pagesAreHiddenStore( (state) => state.pagesAreHidden )
  const currentWorksheet = useSessionStateStore( (state) => state.currentWorksheet )
  const currentGestureIncludesMultitouch = usePageDraggingStore( (state) => state.currentGestureIncludesMultitouch )
  const allowDragPages = !userHasPinchZoomed && !pagesAreHidden && (currentWorksheet.worksheetIndex != null) && !currentGestureIncludesMultitouch
  
  const pageContainerStyle = {
    position: "absolute",
    inset: 0,
    marginLeft: "auto",
    maxHeight: "100%",
    aspectRatio: "496 / 702",
    cursor: allowDragPages ? "ew-resize" : "default",
    userSelect: "none",
  }
  // This container will be the exact same size as the page image
  const { currentPageOfWorksheet, getCurrentWorksheetID } = useSessionStateStore()
  const pageNumber = isLeftOrRight == "left" ? currentPageOfWorksheet : currentPageOfWorksheet + 1
  let pageImageBlob = null
  const currentWorksheetID = getCurrentWorksheetID()
  if(currentWorksheetID){
    //The user has selected a worksheet from the worksheet selection panel
    if( useSessionStateStore.getState().usePlaceholderImages ){ //This doesn't need to be reactive so we can use getState()
      pageImageBlob = "use_placeholder_images"
    }
    else if(!worksheets[currentWorksheetID] || !worksheets[currentWorksheetID].pageBlobs){
      //The user has selected a worksheet that they've not yet downloaded to their system
      pageImageBlob = "worksheet_not_available"
    }
    else if(worksheets[currentWorksheetID].pageBlobs[pageNumber]){
      //The user has selected a worksheet that is downloaded, and a page of pageNumber exists for this worksheet
      pageImageBlob = worksheets[currentWorksheetID].pageBlobs[pageNumber]
    }
  }
  return (
    <div style={pageContainerStyle} ref={pageContainerRef}>
        {/* <PageImage imageSrc="placeholderWorksheetPage.webp" /> */}
        <PageImage pageImageBlob={pageImageBlob} pageNumber={pageNumber} />
        {/* <ChangePageButton isLeftOrRight={isLeftOrRight} /> */}
        <PageNumberIndicator isLeftOrRight={isLeftOrRight} pageNumber={pageNumber} pageExists={pageImageBlob === null} />
    </div>
  )
}

function PageNumberIndicator({isLeftOrRight, pageNumber, pageExists}){
  const pageNumberIndicatorStyle = {
    position: "absolute",
    bottom: "15px",
    width: "38px",
    height: "38px",
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

function PageImage({ pageImageBlob, pageNumber }){
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
    boxSizing: "border-box",
  }
  const { pagesAreHidden } = pagesAreHiddenStore()
  const hasNoPage = (pageImageBlob === null) || pagesAreHidden
  if(hasNoPage){
    return (
      <div style={pageImageStyle}>
      </div>
    )
  }
  if(pageImageBlob === "worksheet_not_available" || pageNumber === 0){
    return (
      <div style={pageImageStyle}>
        {/* <p style={{fontSize: "14px",textWrap: "balance",textAlign: "center"}}>Error</p>
        <p style={{fontSize: "14px",textWrap: "balance",textAlign: "center"}}>It appears this worksheet is not downloaded to your system.</p> */}
      </div>
    )
  }
  let fileURL;
  if( pageImageBlob == "use_placeholder_images" ){
    const imageNumber = ( (pageNumber - 1) % 5) + 1
    fileURL = ( constants.useBasePath ? constants.basePathToUse : "" ) + `/placeholder_images/placeholder_image_${imageNumber}.webp`
  } else {
    fileURL = URL.createObjectURL(pageImageBlob)
  }
  return (
    <img
      src={fileURL}
      style={pageImageStyle} 
      draggable={false} 
      onDragStart={(e) => e.preventDefault()}
    />
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
      {/* <p style={{
        margin: "0 0 12px 0",
        fontFamily: "Roboto, sans-serif",
        fontSize: "12px",
      }}>Students</p> */}
        {
          openStudents.map( (student, index) => {
            return <StudentSessionCard index={index} key={index} />
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
    functionToTrigger={ ()=>{console.log("view log button clicked")} }>
      <p style={{margin: "0", padding: "0", fontSize: "min(1.6vw, 16px)", textWrap: "nowrap"}}>View log</p>
  </GenericPillButton>
  
  const settingsButton =
  <GenericPillButton
    isFilled={false}
    isShort={true}
    additionalStyleObject={{paddingLeft: "min(1.5vw, 30px)", paddingRight: "min(1.5vw, 30px)"}}
    functionToTrigger={ ()=>{ useSessionStateStore.getState().setCurrentPage("SettingsPage") } }>
      <img src={constants.iconsFolderPath + "/settings.svg"} alt="Settings" style={{ width: "23px", height: "23px" }}/>
  </GenericPillButton>
  
  return (
    <div style={worksheetSelectionPanelFooterStyle}>
      { /* viewLogButton */ }
      { settingsButton }
    </div>
  )
}

function StudentSessionCard({index}){
  const openStudents = useSessionStateStore( (state) => state.openStudents )
  let student = openStudents[index]
  let studentIsOther = ( student.type == "other" )
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
  
  if(student.type == "other"){
    studentSessionCardStyle.border = "1px solid #eeeeee"
  }
  
  return (
    <div style={studentSessionCardStyle}>
      <StudentSessionCardHeader index={index} studentName={student.name} />
      <StudentSessionCardWorksheetList index={index} />
      <StudentSessionCardFooter index={index} studentIsOther={studentIsOther} />
    </div>
  )
}

function StudentSessionCardHeader({studentName, index}){
  const { userIsMovingCurrentWorksheet, openStudents, currentWorksheet } = useSessionStateStore.getState()
  const madisonModeActive = useUserSettingsStore( (state) => state.madisonMode )
  let student = openStudents[index]
  
  let headerStyle = {
    display: "flex",
    // justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: madisonModeActive ? "#1ab0cb" : constants.redColor,
    padding: "6px 10px",
    "--original-bg-color": constants.redColor,
    "--pulsate-bg-color": "#eb9286",
  }
  
  if(userIsMovingCurrentWorksheet){
    headerStyle.cursor = "pointer"
  }

  let nameStyle = {
    margin: 0,
    whiteSpace: "nowrap",
    color: "white",
    fontWeight: "normal",
    fontSize: "12px",
    userSelect: "none",
    cursor: "pointer",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    overflow: "hidden"
  }
  
  let studentColorIndicatorCircleStyle = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: constants.colorMap[student.color],
    marginRight: "10px"
  }
  
  let containerStyle = {
    display: "flex",
    alignItems: "center",
    // width: "100%",
    flexGrow: 1,
    containerType: "size"
  }
  
  if(student.type == "other"){
    studentColorIndicatorCircleStyle.backgroundColor = "#00000000"
    headerStyle.backgroundColor = "white"
    // headerStyle.justifyContent = "center"
    headerStyle.padding = "10px 10px"
    headerStyle["--original-bg-color"] = "rgb(223, 223, 223)"
    headerStyle["--pulsate-bg-color"] = "white"
    nameStyle.color = "black"
    delete nameStyle.cursor
    // containerStyle = null
    
  }
  
  
  const onCloseClick = () => {
    const confirmCloseStudent = confirm("Remove " + student.name + " from the session?")
    if(confirmCloseStudent){
      const { deleteOpenStudent } = useSessionStateStore.getState()
      deleteOpenStudent(index)
    }
  }
  
  const moveWorksheetToThisStudent = function(){
    const thisStudentIndex = index
    const { setOpenStudents, setCurrentWorksheet } = useSessionStateStore.getState()
    if(thisStudentIndex !== currentWorksheet.openStudentIndex){
      let newOpenStudents = [...openStudents]
      newOpenStudents[thisStudentIndex].openWorksheets.push( openStudents[currentWorksheet.openStudentIndex].openWorksheets[currentWorksheet.worksheetIndex] )
      openStudents[currentWorksheet.openStudentIndex].openWorksheets.splice(currentWorksheet.worksheetIndex, 1)
      setOpenStudents(newOpenStudents)
      setCurrentWorksheet(thisStudentIndex, newOpenStudents[thisStudentIndex].openWorksheets.length - 1)
    }
  }
  
  let closeButtonOrSubstitute = <CloseButton buttonWidthString="24px" iconWidthString="14px" color="white" onClickFunction={onCloseClick} />
  let studentNotesHaveBeenCopied = openStudents[index].notesCopied
  let copyStudentDataButtonOrSubstitute = <CopyStudentDataButton index={index} hasCopied={studentNotesHaveBeenCopied} />
  if(student.type == "other"){
    closeButtonOrSubstitute = <ClearButtonForOtherStudent index={index} />
  }
  if(userIsMovingCurrentWorksheet){
    closeButtonOrSubstitute = <div style={{width: "24px", height: "24px"}}></div> //empty div
    copyStudentDataButtonOrSubstitute = <div style={{width: "24px", height: "24px"}}></div> //empty div
  }
  if(student.type == "other"){
    copyStudentDataButtonOrSubstitute = null
  }
  
  let onNameClick = function(){
    if( useSessionStateStore.getState().userIsMovingCurrentWorksheet )return
    let newName = prompt(`Enter new name for ${student.name}:`)
    if(newName === null)return
    if(newName.trim().length > 0){
      let newOpenStudents = [...openStudents]
      newOpenStudents[index].name = newName
      useSessionStateStore.getState().setOpenStudents(newOpenStudents)
    }
  }
  return (
    <div style={headerStyle}
    className={  userIsMovingCurrentWorksheet ? "pulsatingHeader" : null  }
    onClick = { userIsMovingCurrentWorksheet ? moveWorksheetToThisStudent : null }
    >
      <div style={containerStyle} className="left-container-for-student-header">
        {/* { (student.type == "other") ? null : <div style={studentColorIndicatorCircleStyle}></div>} */}
        {
          copyStudentDataButtonOrSubstitute
        }
        <div>
          <h1 style={nameStyle} onClick={ (student.type == "other") ? null : onNameClick }>{studentName}</h1>
          { studentNotesHaveBeenCopied ? <p style={{margin:"0", fontSize: "12px", color:"#ffd3d3"}}>Copied</p> : null }
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        
        {
          closeButtonOrSubstitute
        }
      </div>
    </div>
  )
}

function StudentSessionCardFooter({ index, studentIsOther }){
  const footerStyle = {
    backgroundColor: "none",
    // padding: "14px 14px",
    // paddingTop: "0px",
    // justifyContent: "space-between",
    justifyContent: "flex-end",
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
    <div style={ {padding: "10px 6px", paddingTop: "0px"} }>
      <StudentNotesTextArea index={index} studentIsOther={studentIsOther} />
      <div style={footerStyle}>
        {/* <TimerStartButton styleObject={circularButtonStyle} index={index} /> */}
        <AddWorksheetButton styleObject={circularButtonStyle} index={index} />
      </div>
    </div>
  )
}

function ClearButtonForOtherStudent({index}){
  const clearButtonStyle = {
    width: "24px",
    height: "24px",
    backgroundColor: "#00000000",
    border: "none",
    cursor: "pointer",
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  }
  const onClick = function(){
    let confirmClearStudent = confirm("Clear all worksheets from 'Other'?")
    if(!confirmClearStudent)return
    let newOpenStudents = [...useSessionStateStore.getState().openStudents]
    newOpenStudents[index].openWorksheets = []
    useSessionStateStore.getState().setOpenStudents(newOpenStudents)
    
    const indexOfStudentWithCurrentWorksheet = useSessionStateStore.getState().currentWorksheet.openStudentIndex
    if(indexOfStudentWithCurrentWorksheet == index){
      //If "Other" is the student with the currently open worksheet, set to null
      useSessionStateStore.getState().setCurrentWorksheet(null, null)
    }
  }
  return (
    <button style={clearButtonStyle} onClick={onClick}>
      <img src={`${constants.iconsFolderPath}/trash.svg`} alt="Clear" style={{width: "20px"}}/>
    </button>
  )
}

function StudentNotesTextArea({ index, studentIsOther }){
  const openStudents = useSessionStateStore( (state) => state.openStudents )
  if(studentIsOther)return null
  
  const onChange = function(event){
    const openStudentsCopy = [...openStudents]
    openStudentsCopy[index].notes = event.target.value
    useSessionStateStore.getState().setOpenStudents( openStudentsCopy )
  }
  
  function onKeyDown(event){
    if(event.key == "Enter" ){
      const notesTextAreas = document.getElementsByClassName("notes-text-area")
      for(let i = 0; i < notesTextAreas.length; i++){
        notesTextAreas[i].blur()
      }
    }
  }
  
  // const onKeyDown = function(event){
  //   if(event.key == "Enter"){
  //     document.getElementsByClassName("notes-text-area")[index].blur()
  //   }
  // }
  
  const notesTextAreaStyle = {
    width: "100%",
    height: "40px",
    border: "1px solid #A9A09E",
    borderRadius: "8px",
    padding: "4px",
    boxSizing: "border-box",
    resize: "none",
    fontSize: "12px",
    fontFamily: "Roboto, sans-serif"
  }
  return (<textarea 
    style={notesTextAreaStyle}
    placeholder="Notes..."
    value={openStudents[index].notes}
    onChange={ onChange }
    className="notes-text-area"
    onKeyDown={ onKeyDown }
  ></textarea>)
}

function CopyStudentDataButton({ index, hasCopied }){
  const onClick = function(){
    copyStudentData( index )
  }
  const copyStudentDataButtonStyle = {
    width: "24px",
    height: "24px",
    backgroundColor: "#00000000",
    // border: "1px solid #8C2B1E",
    // borderRadius: "5px",
    cursor: "pointer",
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    marginRight: "5px",
    border: "none"
  }
  
  const imgWidth = hasCopied ? "16px" : "14px"
  
  const imgFile = hasCopied ? "copied.svg" : "copy.svg"
  
  return (
    <button style={copyStudentDataButtonStyle} onClick={onClick}>
      <img src={`${constants.iconsFolderPath}/${imgFile}`} alt="Copy" style={{width: imgWidth}}/>
    </button>
    
  )
}

function copyStudentData( index ){
  let stringToCopy = ""
  const { openStudents } = useSessionStateStore.getState()
  const student = openStudents[index]
  for(let i = 0; i < student.openWorksheets.length; i++){
    let worksheetString = condenseWorksheetString(student.openWorksheets[i].id)
    if(student.openWorksheets[i].notes.length > 0)worksheetString += ` (${student.openWorksheets[i].notes})`
    if(i > 0)worksheetString = "__" + worksheetString
    stringToCopy += worksheetString
  }
  if(student.notes.length > 0){
    stringToCopy += `>>${student.notes}`
  }
  
  if(stringToCopy.length == 0){
    alert("No data to copy.")
    return
  }
  
  navigator.clipboard.writeText(stringToCopy).then(() => {
    // alert(`Copied ${student.name}'s data to your clipboard.`)
  })
  
  let newOpenStudents = [...openStudents]
  newOpenStudents[index].notesCopied = true
  useSessionStateStore.getState().setOpenStudents(newOpenStudents)
}

function condenseWorksheetString(worksheetString){
  let newVal = worksheetString.replace(/ WS$/, "")
  let newValArray = newVal.split(" ")
  let filteredValArray = []
  let valsForStringToInclude = [".", "-", "("]
  let valsForStringToMatch = ["HF", "TP"]
  let stringPassesFilter = (stringVal) => {
    for(let i in valsForStringToInclude){
      if(stringVal.includes(valsForStringToInclude[i]))return true
    }
    for(let i in valsForStringToMatch){
      if(stringVal == valsForStringToMatch[i])return true
    }
    return false
  }
  for(let i = 0; i < newValArray.length; i++){
    let val = newValArray[i].toUpperCase()
    if( stringPassesFilter(val)  ){
      if(val == "(OLD)")val = "⌛"
      if(val == "(USA)")val = "(usa)"
      filteredValArray.push(val)
    }
  }
  return filteredValArray.join(" ")
}

function StudentSessionCardWorksheetList({ index }){
  const {openStudents, currentWorksheet} = useSessionStateStore()
  const thisStudent = openStudents[index]
  const thisStudentIndex = index
  
  const worksheetListStyle = {
    display: "flex",
    flexDirection: "column",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "6px",
    paddingRight: "6px",
    overflowY: "auto",
    height: "100%"
  }
  
  if(thisStudent.type == "other"){
    worksheetListStyle.paddingTop = "0px"
  }
  
  let worksheetList = []
  
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
    
    worksheetList.push(<WorksheetListItem key={i} worksheetID={worksheetID} isCurrentWorksheet={isCurrentWorksheet} onClick={onClick} notes={thisStudent.openWorksheets[i].notes} />)
  }
  
  if(worksheetList.length == 0){
    worksheetList = "No worksheets open"
    worksheetListStyle.justifyContent = "center"
    worksheetListStyle.alignItems = "center"
    worksheetListStyle.fontSize = "14px"
    worksheetListStyle.color = "#A9A09E"
  }
  
  return (
    <div style={worksheetListStyle}>
      { worksheetList }
    </div>
  )
}

function WorksheetListItem({ worksheetID, isCurrentWorksheet, onClick, notes }){
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
  const noteStyle = {
    fontSize: "12px",
    margin: "0",
    fontStyle: "italic",
    color: "#858585"
  }
  
  //Remove "WS" or " WS" from the end of the worksheetID for display
  //to conserve space
  const worksheetID_without_WS = worksheetID.replace(/( WS|WS)$/, "");
  
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
        <div style={{width: "100%"}}>
          <p style={worksheetNameParagraphStyle}>{ worksheetID_without_WS }</p>
          { (notes.length > 0) ? <p style={noteStyle}>{notes}</p> : null }
        </div>
        <div style={{display: "flex"}}>
          {/* <MoveWorksheetButton /> */}
          <CloseButton buttonWidthString="24px" iconWidthString="14px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{flexShrink: 0}} />
        </div>
      </div>
    )
  }
  return (
    <button style={worksheetListItemStyle} onClick={onClick}>
      <div style={{width: "100%"}}>
        <p style={worksheetNameParagraphStyle}>{ worksheetID_without_WS }</p>
        { (notes.length > 0) ? <p style={noteStyle}>{notes}</p> : null }
      </div>
    </button>
  )
}

// function MoveWorksheetButton(){
//   const moveWorksheetButtonStyle = {
//     background: "none",
//     border: "none",
//     cursor: "pointer",
//     width: "24px",
//     height: "24px",
//     padding: "0px",
//     verticalAlign: "middle",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     margin: "0px 16px",
//     boxSizing: "border-box",
//     flexShrink: 0
//   }
//   return (
//     <button style={moveWorksheetButtonStyle} onClick={ onMoveWorksheetClick }>
//       <img src={`${constants.iconsFolderPath}/move.svg`} alt="Move Worksheet" style={{ width: "20px", height: "16px" }} />
//     </button>
//   )
  
// }

function onMoveWorksheetClick(){
  //Toggle whether user is moving a worksheet
  // console.log("click")
  const { userIsMovingCurrentWorksheet, setUserIsMovingCurrentWorksheet, setUserCanClickAnywhereToDisableMovingCurrentWorksheet, currentWorksheet } = useSessionStateStore.getState()
  const aWorksheetIsSelected = currentWorksheet.openStudentIndex !== null
  if(!aWorksheetIsSelected) return;
  if(!userIsMovingCurrentWorksheet){
    setUserCanClickAnywhereToDisableMovingCurrentWorksheet(true)
    useUserJustClickedMoveStore.setState(  { userJustClickedMove: true } )
    setTimeout( ()=> {
      useUserJustClickedMoveStore.setState( { userJustClickedMove: false } )
    }, 100)
  }
  setUserIsMovingCurrentWorksheet( !userIsMovingCurrentWorksheet )
}

function TimerStartButton({ styleObject }){
  return (
    <button style={styleObject}>
      <img src={constants.iconsFolderPath + "/timer.svg"} alt="Start timer" style={{ width: "23px", height: "23px" }} />
    </button>
  )
}

function AddWorksheetButton({ styleObject, index }){
  const onClick = function(){
    useAddWorksheetModalIsOpenStore.getState().setAddWorksheetModalIsOpen(true)
    useAddWorksheetModalIsOpenStore.getState().setIndexOfStudentAddingFor(index)
  }
  return (
    <button style={styleObject} onClick={onClick}>
      <img src={constants.iconsFolderPath + "/add_black.svg"} alt="Add worksheet" style={{ width: "16px", height: "16px" }}/>
    </button>
  )
}

function AddStudentButton(){
  // const idOfLastStudentAdded = useSessionStateStore(  (state) => state.idOfLastStudentAdded )
  // const tooManyStudents = idOfLastStudentAdded == "99" ? true : false
  const onClick = function(){
    
    const { currentWorksheet, openStudents, numberInNameOfLastStudentAdded } = useSessionStateStore.getState()
    
    let numberInName = Number(numberInNameOfLastStudentAdded) + 1
    let color = "green"
    numberInName = numberInName.toString()
    if(openStudents.length == 1){
      numberInName = "1"
    }
    useSessionStateStore.setState( (state) => ({ numberInNameOfLastStudentAdded: numberInName }) )
    useSessionStateStore.getState().addOpenStudentToBottom("Student " + numberInName, color)
    //currentWorksheet is defined by the index of the open student, so if a new student
    //is added above the "other" student card, the openStudentIndex will be offset by one. This corrects that
    if( currentWorksheet.openStudentIndex == openStudents.length - 1 ){ //If the current worksheet that's open is in the "Other" student
      useSessionStateStore.getState().setCurrentWorksheet(openStudents.length, 0) //Increase the current worksheet index by 1
      console.log( openStudents.length - 1 )
    }
  }
  return (
    <GenericPillButton useOnClick={true} isFilled={true} isShort={true} functionToTrigger={onClick} additionalStyleObject={{margin: "0 auto", paddingLeft: "15px", paddingRight: "15px"}} id="add-student-button">
      <img src={constants.iconsFolderPath + "/add_white.svg"} alt="Add student" style={{ width: "12px", height: "12px", marginRight: "8px" }}/>
      <p style={{margin: "0", padding: "0"}}>Add Student</p>
    </GenericPillButton>
  )
}

export default WorksheetViewer