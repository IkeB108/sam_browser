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

export function GenericPillButton({ children, onClickFunction, isFilled, isShort, additionalStyleObject}){
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
    cursor: "pointer"
  }
  
  if(additionalStyleObject){
    Object.assign(pillButtonStyle, additionalStyleObject)
  }
  return (
    <button style={pillButtonStyle} onClick={onClickFunction}>
      {children}
    </button>
  )
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
    width: buttonWidthString,
    height: buttonWidthString,
    padding: "0px",
    verticalAlign: "middle",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box"
  }
  
  if (additionalStyleObject){
    Object.assign(closeButtonStyle, additionalStyleObject)
  }
  
  return (
    <button style={closeButtonStyle} onClick={onClickFunction}>
      <img src={`${constants.iconsFolderPath}/close_${color}.svg`} alt="Close" style={{ width: iconWidthString, height: iconWidthString }} />
    </button>
  )
}

export function GenericModal({widthSetting, heightSetting, children, additionalStyleObject, blockBehind}){
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
      <div style={modalStyle}>
        {children}
      </div>
    )
  }
  if(blockBehind){
    return (
      <div style={{position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "#00000055", zIndex: "3"}}>
        <div style={modalStyle}>
          {children}
        </div>
      </div>
    )
  }
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