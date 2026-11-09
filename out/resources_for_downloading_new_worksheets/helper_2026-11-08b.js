let reloadAsPDF_attemptsMaximum = 100
let reloadAsPDF_attemptCount = 0

function attemptToReloadAsRawPDF(){
    if(window["pdfUrl"] && pdfUrl.href){
        console.log("Found a PDF on this page")
        window.location.href = pdfUrl.href
    } else {
        //Did not discover a PDF on this page.
        if(reloadAsPDF_attemptCount == reloadAsPDF_attemptsMaximum){
            console.log("Quitting attempts to reload as PDF")
            clearInterval(reloadAsPDF_attemptInterval)
        }
    }
    reloadAsPDF_attemptCount ++
}

// let reloadAsPDF_attemptInterval = setInterval( attemptToReloadAsRawPDF, 100 )


let downloadRawPDF_attemptMaximum = 100
let downloadRawPDF_attemptCount = 0

function attemptToDownloadRawPDF(){
    if(window["pdfUrl"] && pdfUrl.href){
        console.log("Found a PDF on this page")
        const a = document.createElement("a")
        a.href = pdfUrl.href
        a.download = pdfUrl.searchParams.get("filename").split("_")[1]
        a.click()
        clearInterval(downloadRawPDF_attemptInterval)
    } else {
        //Did not discover a PDF on this page.
        if(downloadRawPDF_attemptCount == downloadRawPDF_attemptMaximum){
            console.log("Quitting attempts to download PDF")
            clearInterval(downloadRawPDF_attemptInterval)
        }
    }
    downloadRawPDF_attemptCount ++
}

let downloadRawPDF_attemptInterval = setInterval( attemptToDownloadRawPDF, 100 )