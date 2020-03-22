import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React from "react";
import "./sass/app.scss";

export const App = () => {
  const [activeIndex, setIndex] = React.useState(0); /* initial index set to 0 - [File] */

  /* change current index on click */
  const handleIndex = (index: any) => {
    setIndex(index);
  };

  return (
    <div className="app">
      <Navbar handleClick={handleIndex} activeIndex={activeIndex} />

      <LeftPane index={activeIndex} />
      <RightPane />

      <Playbar />
    </div>
  );
};
export default App;
