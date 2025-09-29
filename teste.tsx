import React from "react";
import ReactDOMServer from "react-dom/server";

function App() {
  return <h1>Olá mundo!</h1>;
}

console.log(ReactDOMServer.renderToString(<App />));
