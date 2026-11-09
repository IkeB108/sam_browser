//Use this code with a chrome extension like Page Manipulator
//Requires clicking the view solutions button twice
let setupInterval;

if(window.location.href.includes("ViewSolutions.aspx")){
    document.querySelector("body").onLoad = onViewSolutionsLoad()
    console.log("Detected ViewSolutions page & initiating setup")
}


function onViewSolutionsLoad(){
    setupInterval = setInterval( attemptSetup, 300 )
    addResetInterval = setInterval( addResetFunctionToViewSolutionsButton, 100 )
}

function addResetFunctionToViewSolutionsButton(){
    const b = document.getElementById("ctl00_MainContent_btnSolution")
    if( !b.classList.value.includes("has-reset-function") ){
        b.addEventListener("click", ()=> {
            currentWorksheet = 0
            worksheets = getWorksheets()
            wsids = Object.keys(worksheets)
            console.log("reset currentWorksheet to 0")
        })
        console.log("added reset function to viewsolutions")
        b.classList.add("has-reset-function")
    }
}

function wsRows(){
    return $("#ctl00_MainContent_gdvSearchWorksheets").children().first().children()
}

function getWorksheets(){
    const rows = wsRows()
    let ret = {}
    for(let i = 1; i < rows.length; i ++ ){
        const row = rows.eq(i)
        const wsid = row.children().eq(5).text()
        const anchor = row.children().eq(6).children().first()[0]
        ret[wsid] = anchor
    }
    return ret
}

function attemptSetup(){
    let possibleWsRows = $("#ctl00_MainContent_gdvSearchWorksheets").children().first().children() 
    if(possibleWsRows.length > 0){
        clearInterval( setupInterval )
        setup() //We're ready to setup now
    }
}

function setup(){
    console.log("setup triggered")
    worksheets = getWorksheets()
    wsids = Object.keys(worksheets)
    currentWorksheet = 0
    
    document.body.addEventListener("keydown", (e)=>{
        if(e.key == "d"){
            //Download another worksheet
            let wsid = wsids[currentWorksheet]
            console.log("S/N #" + (currentWorksheet + 1) + ": " + wsid)
            let anchor = worksheets[wsid]
            navigator.clipboard.writeText(wsid)
            anchor.click()
            currentWorksheet ++
        }
    })
}