import Script from "next/Script";

const useBasePath = process.env.NEXT_PUBLIC_USEBASEPATH === "true" //grab the NEXT_PUBLIC_USEBASEPATH variable that was declared when “pnpm next build” was called
const basePathToUse = "/sam_browser/out" //No trailing slash. Change to Github repo name if using Github pages.
const cssFilePath = (useBasePath ? basePathToUse : "") + "/global.css"
export const metadata = {
  title: 'SAM Browser',
  description: '',
}

export default function RootLayout({ children }) {
  const bodyStyle = {
    margin: "0 auto",
    maxWidth: "1400px",
    height: "100%"
  }
  return (
    <html lang="en" style={{"height": "100%"}}>
      <head>
        {
          // A JSX element doesn't need to be wrapped in parenthesis when it's only one element with no nested elements
          // You can use "null" in place of JSX when you don't want an element to be added
          // process.env.NODE_ENV === "development" ? <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" strategy="lazyOnload" /> : null
          <Script crossOrigin="anonymous" src="//unpkg.com/react-scan/dist/auto.global.js" strategy="lazyOnload" />
        }
        <link rel="stylesheet" href={cssFilePath} />
      </head>
      <body style={bodyStyle}>{children}</body>
    </html>
  )
}
