import Script from "next/Script";
import constants from "./constants.js";
const cssFilePath = (constants.useBasePath ? constants.basePathToUse : "") + "/global.css"
export const metadata = {
  title: 'SAM Browser',
  description: '',
}

export default function RootLayout({ children }) {
  const bodyStyle = {
    margin: "0 auto",
    height: "100%",
  }
  return (
    <html lang="en" style={{height: "100%"}}>
      <head>
        {
          // A JSX element doesn't need to be wrapped in parenthesis when it's only one element with no nested elements
          // You can use "null" in place of JSX when you don't want an element to be added
          // process.env.NODE_ENV === "development" ? <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" strategy="lazyOnload" /> : null
        }
        {/* <script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" /> */}
        <link rel="stylesheet" href={cssFilePath} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet" />
        <script src={constants.webWorkersFolderPath + "/untar.js"} />
      </head>
      <body style={bodyStyle}>{children}</body>
    </html>
  )
}

