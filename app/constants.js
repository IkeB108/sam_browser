const colorMap = {
  "red": "#BD1452",
  "orange": "#FE9350",
  "yellow": "#FFFB79",
  "green": "#53C162",
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
  softBorderColor: "#A9A09E",
  hardBorderColor: "#000000",
  redColor: "#C56D61",
  purpleColor: "#55587B",
  worksheetSelectionPanelWidth: "300px",
  colorMap,
  getGenericButtonStyle,
  CloseButton,
  useBasePath,
  basePathToUse,
  webWorkersFolderPath: (useBasePath ? basePathToUse : "") + "/web_workers_for_ws_images",
  idbDatabaseVersion: 1, //This is not the version number for the latest iteration of worksheets downloaded. Instead, this is a version number for the format/structure of the IDB database.
}

export default constants
// export { colorMap, panelPadding, worksheetSelectionPanelWidth, getGenericButtonStyle }