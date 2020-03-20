import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React from "react";
import "./sass/app.scss";

export const App = () => {
  return (
    <div className="app">
      <Navbar />

      <LeftPane />
      <RightPane />

      <Playbar />
    </div>
  );
};
export default App;
