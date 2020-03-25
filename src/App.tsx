import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React from "react";
import "./sass/app.scss";

/**
 * TODO : add color text + icons in panes as the variable theme ($third)
 */

export const App = () => {
  const [activeIndex, setIndex] = React.useState(1); /* initial index set to 0 - [File] */

  /* change current index on click */
  const handleIndex = (index: any) => {
    setIndex(index);
  };

  React.useEffect(() => {
    
    let play_pause = document.getElementsByClassName("play-pause")[0]; // play & pause control 
    
    let pane_album = document.getElementById("album") as HTMLDivElement; // album cover
    let album_width_init = pane_album.offsetWidth; // initial width value

    pane_album.style.height = `${album_width_init}px`; // initialize height = same as width

    function ratio() {
      let album_width = pane_album.offsetWidth; // gets album width
      pane_album.style.height = `${album_width}px`; // sets height
    } 

    function togglePlay() {
      /* first child of control which is - material icon */
      if (play_pause.firstElementChild!.textContent === "play_arrow") {
        play_pause.firstElementChild!.textContent = "pause";
      } else {
        play_pause.firstElementChild!.textContent = "play_arrow";
      }
    }

    window.addEventListener("resize", ratio);
    play_pause.addEventListener("click", togglePlay);

    /* on component unmount - event listeners cleanup */
    return function cleanupListener() {
      window.removeEventListener("resize", ratio);
      play_pause.removeEventListener("click", togglePlay);
    };
  });

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
