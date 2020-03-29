import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React, { MouseEvent, ChangeEvent } from "react";
import jsmediatags from "jsmediatags";
import "./sass/app.scss";

/**
 * TODO : add color text + icons in panes as the variable theme ($third)
 * TODO : add checkbox/button to toggle album reflection ON/OFF
 * TODO : check file types + setIndex(1); // set index on [Album] tab when opened files
 */

export const App = () => {
  const [activeIndex, setIndex] = React.useState(0); /* initial index set to 0 - [File] */

  /* change current index on click */
  const handleIndex = (index: any) => {
    setIndex(index);
  };

  React.useEffect(() => {
    let play_pause = document.getElementsByClassName("play-pause")[0]; // play & pause control

    let pane_album = document.getElementById("album") as HTMLDivElement; // album cover
    let album_width_init = pane_album.offsetWidth; // initial width value

    pane_album.style.height = `${album_width_init}px`; // initialize height = same as width

    /* maintains aspect ratio of album cover on resizing */
    function ratio() {
      let album_width = pane_album.offsetWidth; // gets album width
      pane_album.style.height = `${album_width}px`; // sets height
    }

    /* for now it changes [Play - Pause] icon */
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

  const openInput_ref = React.useRef<HTMLInputElement>(null); // input to open new files
  const addInput_ref = React.useRef<HTMLInputElement>(null); // input to add files to existing / current playlist

  /* fires click and opens window to select files */
  function handleInputsClick(e: MouseEvent) {
    if (e.currentTarget.classList.contains("open-files")) {
      openInput_ref.current!.click();
    } else if (e.currentTarget.classList.contains("add-files")) {
      addInput_ref.current!.click();
    }
  }

  let objectUrl: string; // variable to store url objects

  /* fire on change when user wants to [openFiles] */
  function openFiles(event: ChangeEvent) {
    let fileList = document.getElementsByClassName("audioFilesList")[0]; // ul list
    let target = event.currentTarget as HTMLInputElement; // current input [openFiles]
    let audioFiles = target.files; // files from the input

    /* if <ul> has already files from previous selection or some magically appear */
    if (fileList.hasChildNodes()) {
      for (let i = 0; i < fileList.children.length; i++) {
        let oldAudioFiles = fileList.children[i].children[0] as HTMLAudioElement; // each <audio> element in each <li> inside <ul>
        URL.revokeObjectURL(oldAudioFiles.src); // release previous unused URL objects
      }

      /* removes child elements of the <ul> until there is no more <li> */
      while (fileList.firstChild) {
        fileList.removeChild(fileList.firstChild); // or simply fileList.firstChild.remove()
      }
    }

    /* checks if any file was selected or not */
    if (!audioFiles || !audioFiles.length) {
      fileList.innerHTML = "No files selected";
    } else {
      // console.table(audioFiles);
      for (let i = 0; i < audioFiles.length; i++) {
        /* for each audio file */
        const audioEl = document.createElement("audio"); // create <audio> element
        const liEl = document.createElement("li"); // create <li> element
        const trackNb = document.createElement("span"); // create <span> element
        const songTitle = document.createElement("div"); // create <div> element
        const duration = document.createElement("span"); // create <span> element

        trackNb.classList.add("track-number");
        songTitle.classList.add("song-title");
        duration.classList.add("song-duration");

        objectUrl = URL.createObjectURL(audioFiles[i]); // create blob string for each imported audio file
        audioEl.setAttribute("src", objectUrl); // add src to <audio>
        audioEl.setAttribute("data", objectUrl);

        /* read more info from media files */
        jsmediatags.read(audioFiles[i], {
          onSuccess: function(tag) {
            let tags = tag.tags;

            let trackString = tags.track ? `${tags.track.match(/[^/]+/)}.`.padStart(3, "0") : "01.";
            let titleString = tags.title ? `${tags.title}` : `${audioFiles![i].name.replace(/\.[^/.]+$/, "")}`;

            trackNb.textContent = trackString;
            songTitle.textContent = titleString;
            duration.textContent = `${tags.genre}`;

            liEl.appendChild(audioEl); // add <audio> with src
            liEl.appendChild(trackNb); // add <span> with track number
            liEl.appendChild(songTitle); // add <div> with title
            liEl.appendChild(duration);
            fileList.appendChild(liEl); // add <li> to <ul>
          },
          onError: function(error) {
            alert("Something went wrong " + error);
          }
        });
      }
    }
  }

  return (
    <div className="app">
      <Navbar handleClick={handleIndex} activeIndex={activeIndex} />

      <input
        accept="audio/*"
        onChange={e => openFiles(e)}
        className="openFiles-input"
        type="file"
        multiple
        ref={openInput_ref}
      />
      <input accept="audio/*" className="addFiles-input" type="file" multiple ref={addInput_ref} />

      <LeftPane index={activeIndex} handleInputs={handleInputsClick} />
      <RightPane />

      <Playbar />
    </div>
  );
};

export default App;
