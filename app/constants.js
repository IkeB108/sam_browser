'use client'
import { useRef, useEffect } from "react"

const colorMap = {
  "red": "#BD1452",
  "orange": "#FE9350",
  "yellow": "#FFFB79",
  "green": "#91D480",
  "cyan": "#70D9FF",
  "blue": "#2D4CA8",
  "purple": "#8B2F99",
  "pink": "#FF9FDC"
}

function getGenericButtonStyle( primarySecondaryOrTertiary ){
  const genericButtonStyle = {
    padding: "10px",
    borderRadius: "8px",
    cursor: "pointer",
    borderColor: "black",
    borderStyle: "solid",
  }
  
  const primaryStyle = {
    backgroundColor: "black",
    color: "white",
    border: "none"
  }
  const secondaryStyle = {
    backgroundColor: "white",
    color: "black",
  }
  const tertiaryStyle = {
    backgroundColor: "transparent",
    color: "black",
    border: "none"
  }
  
  const allStyles = {
    "primary": primaryStyle,
    "secondary": secondaryStyle,
    "tertiary": tertiaryStyle
  }
  
  return {...genericButtonStyle, ...allStyles[primarySecondaryOrTertiary]}
  
}

export function GenericPillButton({ children, functionToTrigger, isFilled, isShort, additionalStyleObject, useOnClick}){
  //When useOnClick is true, return a regular button that uses onClick to trigger functionToTrigger.
  //If useOnClick is false or not provided, return a <PressDownButton> which triggers functionToTrigger on press down.
  const verticalPadding = isShort ? "10px" : "14px"
  const pillButtonStyle = {
    borderRadius: "200px",
    paddingTop: verticalPadding,
    paddingBottom: verticalPadding,
    paddingLeft: "24px",
    paddingRight: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border:          isFilled ? "none"                  : "1px solid #3d3d3d",
    backgroundColor: isFilled ? (constants.purpleColor) : "white",
    color:           isFilled ? "white"                 : "#3d3d3d",
    fontFamily: "Roboto, sans-serif",
    fontWeight: 500,
    fontSize: "16px",
    cursor: "pointer",
    userSelect: "none"
  }
  
  if(additionalStyleObject){
    Object.assign(pillButtonStyle, additionalStyleObject)
  }
  
  if(useOnClick){
    return (
      <button style={pillButtonStyle} onClick={functionToTrigger}>
        {children}
      </button>
    )
  }
  if(!useOnClick){
    return (
      <PressDownButton style={pillButtonStyle} functionToTrigger={functionToTrigger}>
        {children}
      </PressDownButton>
    )
  }
}



// function CloseButton(padding, onClickFunction){
//   const closeButtonStyle = {
//     position: "absolute",
//     top: padding,
//     right: padding,
//     backgroundColor: "transparent",
//     border: "none",
//     cursor: "pointer",
//     width: "40px",
//     height: "40px",
//     // borderRadius: "50%",
//     fontSize: "30px",
//     color: "black"
//   }
//   return (
//     <button style={closeButtonStyle} onClick={onClickFunction}>×</button>
//   )
// }


export function CloseButton({ buttonWidthString, iconWidthString, color, onClickFunction, additionalStyleObject }){
  const closeButtonStyle = {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
  }
  
  if(buttonWidthString){
    closeButtonStyle.width = buttonWidthString
    closeButtonStyle.height = buttonWidthString
  }
  
  if (additionalStyleObject){
    Object.assign(closeButtonStyle, additionalStyleObject)
  }
  let iconStyle = null
  if(iconWidthString){
    iconStyle = { width: iconWidthString, height: iconWidthString }
  }
  
  return (
    <button style={closeButtonStyle} onClick={onClickFunction}>
      <img src={`${constants.iconsFolderPath}/close_${color}.svg`} alt="Close" style={iconStyle} />
    </button>
  )
}

export function GenericModal({refSetting, widthSetting, heightSetting, children, additionalStyleObject, blockBehind}){
  //blockBehind = boolean: whether to disable interactivity of everything behind modal
  
  const modalStyle = {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: widthSetting,
    height: heightSetting,
    backgroundColor: "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.45)",
    zIndex: 3,
    overflow: "auto",
    padding: "20px",
    borderRadius: "24px",
  }
  
  if (additionalStyleObject){
    Object.assign(modalStyle, additionalStyleObject)
  }
  if(!blockBehind){
    return (
      <div ref={ refSetting ? refSetting : null } style={modalStyle}>
        {children}
      </div>
    )
  }
  if(blockBehind){
    return (
      <div style={{position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "#00000055", zIndex: "3"}}>
        <div ref={ refSetting ? refSetting : null } style={modalStyle}>
          {children}
        </div>
      </div>
    )
  }
}

export function PressDownButton(props){ //Expects a functionToTrigger prop
  const buttonElementRef = useRef(null)
  
  if(!props.functionToTrigger){
    console.error("PressDownButton requires a functionToTrigger prop")
  }
  if(props.onClick){
    console.warn("PressDownButton is not meant to use onClick prop")
  }
  
  /*
  We want this button to be triggered on mousedown or touchstart, rather than
  a regular click event (to allow for a bit of finger or cursor sliding).
  In theory, we could add onMouseDown and onTouchStart
  properties to the <button> in the return statement the "React way",
  but that seems to sometimes cause the event to trigger twice.
  The fix is to call event.preventDefault() from within the event handler.
  However, for some reason, event.preventDefault()
  won't work in React's onMouseDown or onTouchStart handlers, seemingly because
  react is invoking these event handlers in "passive" mode. So instead, we have
  to add the event listeners manually on component mount by using useRef() to
  reference the html button directly.
  */
 
  const onMouseDownOrTouchStart = function(e){
    e.preventDefault()
    props.functionToTrigger()
  }
 
  useEffect(() => {
    buttonElementRef.current.addEventListener("mousedown", onMouseDownOrTouchStart)
    buttonElementRef.current.addEventListener("touchstart", onMouseDownOrTouchStart)
    return () => {
      //This return statement removes event listeners and should only be needed for
      //react's strict mode, which doesn't appear in production.
      //Without this return statement, the event listeners would be added twice
      //in strict mode.
      if(buttonElementRef.current){
        buttonElementRef.current.removeEventListener("mousedown", onMouseDownOrTouchStart)
        buttonElementRef.current.removeEventListener("touchstart", onMouseDownOrTouchStart)
      }
    }
  }, [])
  
  const propsToPass = {...props}
  delete propsToPass.functionToTrigger
  
  return (
    <button ref={buttonElementRef} {...propsToPass}> {props.children} </button>
  )
}

const useBasePath = process.env.NEXT_PUBLIC_USEBASEPATH === "true" //grab the NEXT_PUBLIC_USEBASEPATH variable that was declared when “pnpm next build” was called
const basePathToUse = "/sam_browser/out" //No trailing slash. Change to Github repo name if using Github pages.

const constants = {
  softBorderColor: "#A9A09E",
  hardBorderColor: "#000000",
  redColor: "#C56D61",
  purpleColor: "#55587B",
  nearBlackColor: "#3d3d3d",
  worksheetSelectionPanelWidth: "240px",
  colorMap,
  getGenericButtonStyle,
  CloseButton,
  useBasePath,
  basePathToUse,
  webWorkersFolderPath: (useBasePath ? basePathToUse : "") + "/web_workers_for_ws_images",
  iconsFolderPath: (useBasePath ? basePathToUse : "") + "/icons",
  idbDatabaseVersion: 1, //This is not the version number for the latest iteration of worksheets downloaded. Instead, this is a version number for the format/structure of the IDB database.
}

export default constants
// export { colorMap, panelPadding, worksheetSelectionPanelWidth, getGenericButtonStyle }