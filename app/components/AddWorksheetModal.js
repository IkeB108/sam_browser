import { GenericModal, CloseButton } from "../constants.js";
import constants from "../constants.js";
import { useAddWorksheetModalIsOpenStore } from "../stores"
import { useSessionStateStore, useAllStudentsStore } from "../page.js"

export function AddWorksheetModal(){
  const onCloseClick = function(){
    useAddWorksheetModalIsOpenStore.setState({ addWorksheetModalIsOpen: false })
  }
  
  const { studentAddingFor } = useAddWorksheetModalIsOpenStore.getState() //We don't need a hook here because this value won't change while modal is open
  // ^ This value is student ID number.
  let studentName
  if(studentAddingFor == "other"){
    studentName = "Other"
  } else {
    const { allStudents } = useAllStudentsStore.getState()
    studentName = allStudents[studentAddingFor].name
  }
  return (
    <GenericModal blockBehind={true} widthSetting="96%" heightSetting="96%" additionalStyleObject={{boxSizing: "border-box", display: "flex", flexDirection:"column", maxWidth: "1000px", maxHeight: "700px"}}>
      <div width="100%" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}> {/*Container for modal title and close button*/}
        <h1 style={{
          "fontFamily": "Roboto, sans-serif",
          "fontSize": "18px",
          "fontWeight": "normal",
          "margin": "0"
        }}>Add Worksheet for {studentName}</h1>
        <CloseButton buttonWidthString="37px" iconWidthString="22px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{ top: "10px", right: "10px" }} />
      </div>
      <div style={{display: "flex", height: "100%"}}> {/* Body of the modal*/}
        <div style={{flexGrow: "1"}}>
          Hello
        </div>
        <Keypad />
      </div>
    </GenericModal>
  )
}

function Keypad(){
  const onKeypadKeyPress = function(val){
    console.log(val)
  }
  const KeypadKey = ({val}) => {
    const keypadKeyStyle = {
      backgroundColor: "white",
      border: "1px solid #DAD6D5",
      boxShadow: "0px 1px 4px #0000001a",
      width: "65px",
      height: "65px",
      color: "#3D3D3D",
      borderRadius: "20px",
      fontFamily: "Roboto, sans-serif",
      fontSize: "30px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }
    let innerContent;
    if(val == "backspace"){
      innerContent = <img src={ constants.iconsFolderPath + "/backspace.svg"} alt="Backspace" style={{width: "50%", aspectRatio: "1"}} />
    } else if(val == "clear"){
      innerContent = "Clear"
      keypadKeyStyle.backgroundColor = constants.redColor
      keypadKeyStyle.color = "white"
      keypadKeyStyle.fontSize = "20px"
    } else if(val == "open"){
      innerContent = "Open"
      keypadKeyStyle.width = "100px"
      keypadKeyStyle.backgroundColor = "#eae4d444"
      keypadKeyStyle.border = "1px solid rgb(204, 194, 166)"
      keypadKeyStyle.fontSize = "20px"
    } else {
      innerContent = val
    }
    return (
      <button onClick={ ()=>{ onKeypadKeyPress(val) } } style={keypadKeyStyle}>
        {innerContent}
      </button>
    )
  }
  
  const keypadStyle = {
    margin: "auto 0"
  }
  
  const keyRowStyle = {
    display: "flex",
    gap: "6px",
    justifyContent: "center",
    marginBottom: "6px"
  }
  const bottomKeyRowStyle = {
    display: "flex",
    gap: "6px",
    justifyContent: "center"
  }
  return (
    <div style={keypadStyle}>
      <div style={keyRowStyle}>
        <KeypadKey val="1" />
        <KeypadKey val="2" />
        <KeypadKey val="3" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="4" />
        <KeypadKey val="5" />
        <KeypadKey val="6" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="7" />
        <KeypadKey val="8" />
        <KeypadKey val="9" />
      </div>
      <div style={keyRowStyle}>
        <KeypadKey val="backspace" />
        <KeypadKey val="0" />
        <KeypadKey val="clear" />
      </div>
      <div style={bottomKeyRowStyle}>
        <KeypadKey val="open" />
      </div>
    </div>
  )
}