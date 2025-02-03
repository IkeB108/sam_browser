const panelPadding = "6px"
const worksheetSelectionPanelWidth = "300px"
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

export { colorMap, panelPadding, worksheetSelectionPanelWidth }