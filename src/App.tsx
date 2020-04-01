import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React, { MouseEvent, ChangeEvent } from "react";
import jsmediatags from "jsmediatags";
import "./sass/app.scss";

/**
 * TODO : add color text + icons in panes as the variable theme ($third variable)
 * TODO : add checkbox/button to toggle album reflection ON/OFF
 * TODO : check file types + setIndex(1); // set index on [Album] tab when opened files
 * TODO : use <ul> element -> list will contain album cover, band name, album name, maybe genre and list items
 * TODO : try to figure out the fucking scrollbar behavior in Chrome when audio controls are present and music is playing
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
        fileList.removeChild(fileList.firstChild); // or simply fileList.firstChild.remove() but no support for IE
      }
    }

    /* checks if any file was selected or not */
    if (!audioFiles || !audioFiles.length) {
      fileList.innerHTML = "No files selected";
    } else {
      for (let i = 0; i < audioFiles.length; i++) {
        /* for each audio file */

        /**
         * -------------------------------------------------------
         * * Create <ul> | <li> | <audio> | <span> | <div> | <img>
         * -------------------------------------------------------
         */

        const durationEl = document.createElement("span");
        const audioEl = document.createElement("audio");
        const trackEl = document.createElement("span");
        const titleEl = document.createElement("div");
        const imageEl = document.createElement("img");
        const liEl = document.createElement("li");
        const ulEl = document.createElement("ul");

        /**
         * --------------------------------
         * * Set className for each element
         * --------------------------------
         */

        durationEl.classList.add("song__duration");
        imageEl.classList.add("album__cover");
        audioEl.classList.add("song__audio");
        titleEl.classList.add("song__title");
        trackEl.classList.add("track-nb");
        ulEl.classList.add("album");
        liEl.classList.add("song");

        // create blob string for each imported audio file and add src for each <audio>
        objectUrl = URL.createObjectURL(audioFiles[i]);
        audioEl.setAttribute("src", objectUrl);

        audioEl.onloadedmetadata = function() {
          jsmediatags.read(audioFiles![i], {
            onSuccess: function(tag) {
              let tags = tag.tags;

              /**
               * -------------------
               * * set all variables
               * -------------------
               */
              let songTitle = tags.title ? `${tags.title}` : `${audioFiles![i].name.replace(/\.[^/.]+$/, "")}`; // if title undefined take file name and replace extension by empty string
              let trackNb = tags.track ? `${tags.track.match(/[^/]+/)}`.padStart(2, "0") : "01"; // if track number undefined puts 01 otherwise takes only string before "/" if there's any and if string doesn't have at least 2 numbers then adds leading zero
              let duration = audioEl.duration;

              /**
               * -----------------------------------
               * * set attributes and data / content
               * -----------------------------------
               */

              // liEl.setAttribute("data-title", songTitle);
              liEl.setAttribute("data-track", trackNb);

              trackEl.textContent = trackNb + ".";
              titleEl.textContent = songTitle;
              durationEl.textContent = convertSeconds(duration);

              /**
               * -------------------
               * * append to the DOM
               * -------------------
               */

              liEl.appendChild(audioEl); // add <audio> with src
              liEl.appendChild(trackEl); // add <span> with track number
              liEl.appendChild(titleEl); // add <div> with title
              liEl.appendChild(durationEl);
              fileList.appendChild(liEl); // add <li> to <ul>
            },
            onError: function(error) {
              alert("Something went wrong " + error);
            }
          });
        };
      }
    }
  }

  function convertSeconds(duration: number) {
    let hours, minutes, seconds;

    hours = (Math.floor(duration / 3600) % 60).toString().padStart(2, "0");
    minutes = (Math.floor(duration / 60) % 60).toString().padStart(2, "0");
    seconds = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");

    if (duration >= 3600) {
      return hours + ":" + minutes + ":" + seconds;
    } else {
      return minutes + ":" + seconds;
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
