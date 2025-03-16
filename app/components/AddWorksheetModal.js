import { GenericModal, CloseButton } from "../constants.js";
import { useAddWorksheetModalIsOpenStore } from "../stores"

export function AddWorksheetModal(){
  const onCloseClick = function(){
    useAddWorksheetModalIsOpenStore.setState({ addWorksheetModalIsOpen: false })
  }
  return (
    <GenericModal widthSetting="90%" heightSetting="90%" additionalStyleObject={{boxSizing: "border-box"}}>
      <div width="100%" style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <h1 style={{
          "fontFamily": "Roboto, sans-serif",
          "fontSize": "18px",
          "fontWeight": "normal",
          "margin": "0"
        }}>Add Worksheet</h1>
        <CloseButton buttonWidthString="37px" iconWidthString="22px" color="black" onClickFunction={onCloseClick} additionalStyleObject={{ top: "10px", right: "10px" }} />
      </div>
    </GenericModal>
  )
}