import Playbar from "./components/Playbar";
import LeftPane from "./components/LeftPane";
import RightPane from "./components/RightPane";
import React from "react";
import "./sass/app.scss";

export const App = () => {
  return (
    <div className="app">
      <Playbar />

      <LeftPane />
      <RightPane />
    </div>
  );
};
export default App;
