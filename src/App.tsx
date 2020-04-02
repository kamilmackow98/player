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
 * TODO : event delegation for each of the <li>
 * TODO : sort function / button to sort albums by ARTIST NAME in playlist from A to Z AND THEN track numbers inside
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
    let target = event.currentTarget as HTMLInputElement; // current input [openFiles]
    let audioFiles = target.files; // files from the input

    /* if <ul> has already files from previous selection or some magically appear */
    // if (fileList.hasChildNodes()) {

    /*
      for (let i = 0; i < fileList.children.length; i++) {
        let oldAudioFiles = fileList.children[i].children[0] as HTMLAudioElement; // each <audio> element in each <li> inside <ul>
        URL.revokeObjectURL(oldAudioFiles.src); // release previous unused URL objects
      }

      // removes child elements of the <ul> until there is no more <li> 
      while (fileList.firstChild) {
        fileList.removeChild(fileList.firstChild); // or simply fileList.firstChild.remove() but no support for IE
      }

      */
    // }

    /* checks if any file was selected or not */
    if (!audioFiles || !audioFiles.length) {
      alert("No files selected");
    } else {
      /**
       *
       * * <div class="album" />
       *
       * * <div class="album__info" />
       * *    <img class="album__cover" />
       * *    <div class="band__name" />
       * *    <div class="album__title" />
       *
       * *        <div class="title" />
       * *        <span class="line" />
       * *        <span class="album__year" />
       *
       * *    <span class="album__genre" />
       *
       * * <ul class="audio__list" />
       *
       * *    <li class="song" />
       *
       * *        <audio class="song__audio" />
       * *        <span class="track-nb" />
       * *        <div class="song__title" />
       * *        <span class="song__duration" />
       *
       */
      /*
      const albumContainerEl = document.createElement("div");

      const albumInfoEl = document.createElement("div");

      const albumImageEl = document.createElement("img");
      const bandNameEl = document.createElement("div");
      const albumTitleEl = document.createElement("div");
      const albumGenreEl = document.createElement("span");

      const titleDivEl = document.createElement("div");
      const titleLineEl = document.createElement("span");
      const albumYearEl = document.createElement("span");

      const audioUlEl = document.createElement("ul");

      albumContainerEl.classList.add("album");
      albumInfoEl.classList.add("album__info");
      albumImageEl.classList.add("album__cover");
      bandNameEl.classList.add("band__name");
      albumTitleEl.classList.add("album__title");
      albumGenreEl.classList.add("album__genre");
      titleDivEl.classList.add("title");
      titleLineEl.classList.add("line");
      albumYearEl.classList.add("album__year");
      audioUlEl.classList.add("audio__list");

      */

      for (let i = 0; i < audioFiles.length; i++) {
        /* for each audio file */

        const durationEl = document.createElement("span");
        const audioEl = document.createElement("audio");
        const trackEl = document.createElement("span");
        const titleEl = document.createElement("div");
        const liEl = document.createElement("li");

        /**
         * --------------------------------
         * * Set className for each element
         * --------------------------------
         */

        durationEl.classList.add("song__duration");
        audioEl.classList.add("song__audio");
        titleEl.classList.add("song__title");
        trackEl.classList.add("track-nb");
        liEl.classList.add("song");

        // create blob string for each imported audio file and add src for each <audio>
        objectUrl = URL.createObjectURL(audioFiles[i]);
        audioEl.setAttribute("src", objectUrl);

        audioEl.onloadedmetadata = function() {
          jsmediatags.read(audioFiles![i], {
            onSuccess: function(tag) {
              let tags = tag.tags;

              let songTitle = tags.title ? `${tags.title}` : `${audioFiles![i].name.replace(/\.[^/.]+$/, "")}`; // if title undefined take file name and replace extension by empty string
              let trackNb = tags.track ? `${tags.track.match(/[^/]+/)}`.padStart(2, "0") : "01"; // if track number undefined puts 01 otherwise takes only string before "/" if there's any and if string doesn't have at least 2 numbers then adds leading zero
              let songAlbum = tags.album ? `${tags.album}` : "Unknown";
              let artist = tags.artist ? `${tags.artist}` : "Unknown";
              let albumYear = tags.year ? `${tags.year}` : "Unknown";
              let albumGenre = tags.genre ? `${tags.genre}` : "Unknown";
              let duration = audioEl.duration;

              // let albumCollections = document.querySelectorAll(".album");

              /* 
                3 options :
                  - song album is unknown - add to the Album <div> with data-album="unknown"
                  - song album is a new one - create new Album <div> with data-album="new-album"
                  - song album was already added - add song to the the existing Album <div>
              */

              liEl.setAttribute("data-track", trackNb);

              durationEl.textContent = convertSeconds(duration);
              trackEl.textContent = trackNb + ".";
              titleEl.textContent = songTitle;

              liEl.appendChild(audioEl); // add <audio> with src
              liEl.appendChild(trackEl); // add <span> with track number
              liEl.appendChild(titleEl); // add <div> with title
              liEl.appendChild(durationEl);

              if (songAlbum === "Unknown") {
                let unknownAlbumContainer = document.querySelector(".album[data-album='unknown']");
                let unknownAudioList = document.querySelector(".album[data-album='unknown'] .audio__list");

                if (unknownAlbumContainer && unknownAudioList) {
                  unknownAlbumContainer.classList.remove("hidden");
                  unknownAudioList.appendChild(liEl);
                }
              } else if (songAlbum) {
                // let albumsContainers = document.querySelectorAll(".album:not(.unknown)");

                let albumsContainers = document.querySelector(`.album[data-album='${songAlbum}']`);

                if (albumsContainers) {
                  
                  let ulList = albumsContainers.getElementsByTagName("ul")[0];
                  ulList.appendChild(liEl);
                  


                } else {
                  let rightPaneContent = document.getElementsByClassName("right-pane__content")[0];

                  /**
                   * * Create DOM elements
                   */

                  const albumContainerEl = document.createElement("div");

                  const albumInfoEl = document.createElement("div");

                  const albumImageEl = document.createElement("img");
                  const bandNameEl = document.createElement("div");
                  const albumTitleEl = document.createElement("div");
                  const albumGenreEl = document.createElement("span");

                  const titleDivEl = document.createElement("div");
                  const titleLineEl = document.createElement("span");
                  const albumYearEl = document.createElement("span");

                  const audioUlEl = document.createElement("ul");

                  albumContainerEl.classList.add("album");
                  albumInfoEl.classList.add("album__info");
                  albumImageEl.classList.add("album__cover");
                  bandNameEl.classList.add("band__name");
                  albumTitleEl.classList.add("album__title");
                  albumGenreEl.classList.add("album__genre");
                  titleDivEl.classList.add("title");
                  titleLineEl.classList.add("line");
                  albumYearEl.classList.add("album__year");
                  audioUlEl.classList.add("audio__list");

                  /**
                   * * Set attributes and data
                   */

                  albumContainerEl.setAttribute("data-album", songAlbum);
                  bandNameEl.textContent = artist;
                  titleDivEl.textContent = songAlbum;
                  albumYearEl.textContent = albumYear;
                  albumGenreEl.textContent = albumGenre;

                  /**
                   * * Append elements
                   */

                  rightPaneContent.appendChild(albumContainerEl);
                  albumContainerEl.appendChild(albumInfoEl);
                  albumInfoEl.appendChild(albumImageEl);
                  albumInfoEl.appendChild(bandNameEl);
                  albumInfoEl.appendChild(albumTitleEl);
                  albumTitleEl.appendChild(titleDivEl);
                  albumTitleEl.appendChild(titleLineEl);
                  albumTitleEl.appendChild(albumYearEl);
                  albumInfoEl.appendChild(albumGenreEl);
                  albumContainerEl.appendChild(audioUlEl);

                  audioUlEl.appendChild(liEl);
                }
              } else {
                alert("Something went wrong");
              }
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
