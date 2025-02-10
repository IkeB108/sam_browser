import constants from '../constants'
function SettingsPage(){
  const settingsPageStyle = {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    padding: constants.pagePadding
  }
  return (
    <div style={settingsPageStyle}>
      <h1>Settings</h1>
      { constants.CloseButton(constants.pagePadding, ()=>{ useSessionStateStore.getState().setCurrentPage("WorksheetViewer") }) }
    </div>
  )
}

export default SettingsPage