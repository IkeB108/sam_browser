const colorMap = {
  "red": "#B90000",
  "orange": "#E15E00",
  "yellow": "#D4D300",
  "green": "#2D8B1E",
  "cyan": "#0DB6B3",
  "blue": "#0d22b6",
  "purple": "#7e069d",
  "pink": "#da2bb9"
}
for(let i in colorMap){
  colorMap[i] = {
    "standard": colorMap[i],
    "light": colorMap[i] + "55"
  }
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



function CloseButton(padding, onClickFunction){
  const closeButtonStyle = {
    position: "absolute",
    top: padding,
    right: padding,
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    width: "40px",
    height: "40px",
    // borderRadius: "50%",
    fontSize: "30px",
    color: "black"
  }
  return (
    <button style={closeButtonStyle} onClick={onClickFunction}>×</button>
  )
}
const useBasePath = process.env.NEXT_PUBLIC_USEBASEPATH === "true" //grab the NEXT_PUBLIC_USEBASEPATH variable that was declared when “pnpm next build” was called
const basePathToUse = "/sam_browser/out" //No trailing slash. Change to Github repo name if using Github pages.

const constants = {
  panelPadding: "6px",
  pagePadding: "18px",
  worksheetSelectionPanelWidth: "300px",
  colorMap,
  getGenericButtonStyle,
  CloseButton,
  useBasePath,
  basePathToUse,
  webWorkersFolderPath: (useBasePath ? basePathToUse : "") + "/web_workers_for_ws_images"
}

export default constants
// export { colorMap, panelPadding, worksheetSelectionPanelWidth, getGenericButtonStyle }