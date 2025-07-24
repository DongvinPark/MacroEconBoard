import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// main.tsx 는 웹앱의 진짜 entry point다. 백엔드로 치면 main.cpp, main.go, main.c와 비슷하다.
// App.txt를 호출하는 것도 main.txt의 역할이다.

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);