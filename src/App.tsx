import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";
import React, { ChangeEvent } from "react";
import jsmediatags from "jsmediatags";
import "./sass/app.scss";

import UnknownImage from "./images/unk3.png";

/**
 * TODO : add color text + icons in panes as the variable theme ($third variable)
 * TODO : add checkbox/button to toggle album reflection ON/OFF
 * TODO : check file types
 * TODO : set index on [Album] tab after opening the files
 * TODO : button with sort function to sort albums by ARTIST NAME in playlist from A to Z
 * TODO : in openFiles() instead of opening and creatingObjectURL album cover / picture from every audio file - get from the first file with track number === 01
 * TODO : add condition to check if audio / song already exists (maybe)
 * TODO : add keyboard shortcuts (Play-Pause on spacebar | Next-Previous maybe Ctrl+L and Ctrl+J)
 * TODO : change context menu (right click)
 *
 * ! Event delegation apparently is discouraged in React. React handles it on its own so each <li> has EventListener
 */

export const App = () => {
  const [activeIndex, setIndex] = React.useState(0); /* initial index set to 0 - [File] */
  const [isPlaying, setIsPlaying] = React.useState(false); /* state to check if audio is playing */
  const [isReady, setIsReady] = React.useState(false);

  /* change current index on click */
  const handleIndex = (index: any) => {
    setIndex(index);
  };

  interface Songs {
    albumTitle?: string;
    liElements?: Array<HTMLLIElement>;
  }

  let songs: Array<Songs> = [];
  let playlist: Array<HTMLLIElement> = [];

  // let refSongs = React.useRef(songs);

  React.useEffect(() => {
    let play_pause = document.getElementsByClassName("play-pause")[0]; // play & pause control

    let pane_album = document.getElementById("album") as HTMLDivElement; // album cover
    let album_width_init = pane_album.offsetWidth; // initial width value

    let currentTimeEl = document.getElementsByClassName("current-time")[0] as HTMLSpanElement;
    let lineProgressBar = document.querySelector(".progress-bar .line") as HTMLSpanElement;

    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;
    let progressBar = document.getElementsByClassName("progress-bar")[0] as HTMLSpanElement;
    let timestamp = document.getElementsByClassName("timestamp")[0] as HTMLSpanElement;

    pane_album.style.height = `${album_width_init}px`; // initialize height = same as width

    /* maintains aspect ratio of album cover on resizing */
    function ratio() {
      let album_width = pane_album.offsetWidth; // gets album width
      pane_album.style.height = `${album_width}px`; // sets height
    }

    /* for now it changes [Play - Pause] icon */
    function togglePlay() {
      /* first child of control which is - material icon */
      if (mainAudio.src && mainAudio.duration) {
        if (isPlaying === false) {
          setIsPlaying(true);
          mainAudio.play();
        } else if (isPlaying === true) {
          setIsPlaying(false);
          mainAudio.pause();
        }
      }
    }

    /* update progress bar line on timeupdate of mainAudio */
    function updateProgressBar() {
      currentTimeEl.textContent = convertSeconds(mainAudio.currentTime);
      let percentage = parseFloat(((mainAudio.currentTime / mainAudio.duration) * 100).toFixed(3));

      lineProgressBar.style.transform = `translate3d(${-100.2 + percentage}%, 0, 0)`;
    }

    function setCurrentTime(this: HTMLElement, event: MouseEvent) {
      /* element distance from the left of the page - distance of element from the beginning of the parent 
      IF PARENT HAS RELATIVE POSITION add "- 100px" because of that left controls that take 100px of space */
      let xCord = event.pageX - this.offsetLeft;

      let totalWidth = progressBar.offsetWidth; // width of progress bar
      let percentage = xCord / totalWidth;

      if (mainAudio.src && mainAudio.duration) {
        let audioSeconds = mainAudio.duration * percentage; // get current seconds / time from percentage of the full audio duration
        mainAudio.currentTime = audioSeconds;

        if (mainAudio.paused) {
          setIsPlaying(true);
          mainAudio.play();
        }
      }
    }

    function progressTimestamp(this: HTMLElement, event: MouseEvent) {
      let x = event.pageX;

      let totalWidth = progressBar.offsetWidth;
      let percentage = (x - this.offsetLeft) / totalWidth;

      if (mainAudio.src && mainAudio.duration) {
        timestamp.style.display = "flex";
        timestamp.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0)`;

        let audioSeconds = mainAudio.duration * percentage;
        timestamp.textContent = convertSeconds(audioSeconds);
      }
    }

    function hideTimestamp() {
      timestamp.style.display = "none";
    }

    function play() {
      setIsPlaying(true);
    }

    function pause() {
      setIsPlaying(false);
    }

    function spacebarToggle(event: KeyboardEvent) {
      if (event.keyCode === 32 && mainAudio.src) {
        event.preventDefault();
        togglePlay();
      }
    }

    window.addEventListener("keydown", spacebarToggle);

    progressBar.addEventListener("mousemove", progressTimestamp);
    progressBar.addEventListener("mouseleave", hideTimestamp);
    progressBar.addEventListener("click", setCurrentTime);

    mainAudio.addEventListener("timeupdate", updateProgressBar);
    mainAudio.addEventListener("pause", pause);
    mainAudio.addEventListener("play", play);

    play_pause.addEventListener("click", togglePlay);
    window.addEventListener("resize", ratio);

    /* on component unmount - event listeners cleanup */
    return function cleanupListener() {
      window.removeEventListener("keydown", spacebarToggle);

      progressBar.removeEventListener("mousemove", progressTimestamp);
      progressBar.removeEventListener("mouseleave", setCurrentTime);
      progressBar.removeEventListener("click", setCurrentTime);

      mainAudio.removeEventListener("timeupdate", updateProgressBar);
      mainAudio.removeEventListener("pause", pause);
      mainAudio.removeEventListener("play", play);

      play_pause.removeEventListener("click", togglePlay);
      window.removeEventListener("resize", ratio);
    };
  });

  const openInput_ref = React.useRef<HTMLInputElement>(null); // input to open new files
  const addInput_ref = React.useRef<HTMLInputElement>(null); // input to add files to existing / current playlist

  /* fires click and opens window to select files */
  function handleInputsClick(e: React.MouseEvent) {
    if (e.currentTarget.classList.contains("open-files")) {
      openInput_ref.current!.click();
    } else if (e.currentTarget.classList.contains("add-files")) {
      addInput_ref.current!.click();
    }
  }

  let objectUrl: string; // variable to store url objects

  /* fire on change when user opens files */
  function openFiles(event: ChangeEvent) {
    let rightPaneContent = document.getElementsByClassName("right-pane__content")[0]; // container with all [albums] <div>
    let allAlbumsNotUnkown = document.querySelectorAll(".album:not(.unknown)"); // get all the albums but not unknown
    let target = event.currentTarget as HTMLInputElement; // current input [openFiles]
    let audioFiles = target.files; // files from the input

    let unknownAudioList = document.querySelector(".album[data-album='unknown'] .audio__list");
    let unknownAlbum = document.querySelector(".album[data-album='unknown']");

    if (unknownAudioList && unknownAlbum) {
      while (unknownAudioList!.firstChild) {
        unknownAudioList!.removeChild(unknownAudioList!.firstChild);
      }
      unknownAlbum.classList.add("hidden");
    }

    allAlbumsNotUnkown.forEach(function (child) {
      rightPaneContent.removeChild(child);
    });

    /* if right pane has already files from previous selection or some magically appear
       checks if there's any div with "album" class but not the hidden <div> with unknown album */
    if (allAlbumsNotUnkown.length) {
      let imgElements = document.querySelectorAll(".album__cover:not(.unknownImg)");
      let audioElements = document.querySelectorAll(".song__audio");

      /* releases from memory all URL objects from <img> files src */
      for (let k = 0; k < imgElements.length; k++) {
        let imgSrc = imgElements[k] as HTMLImageElement;
        URL.revokeObjectURL(imgSrc.src);
      }

      /* releases from memory all URL objects from <audio> files src */
      for (let l = 0; l < audioElements.length; l++) {
        let oldAudio = audioElements[l] as HTMLAudioElement;
        URL.revokeObjectURL(oldAudio.src); // release previous URL objects / src for audio files
      }
    }

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

      playlist = [];

      setIsReady(true);

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

        audioEl.onloadedmetadata = function () {
          jsmediatags.read(audioFiles![i], {
            onSuccess: function (tag) {
              let type = tag.type;
              let tags = tag.tags;

              let songTitle = tags.title ? `${tags.title}` : `${audioFiles![i].name.replace(/\.[^/.]+$/, "")}`; // if title undefined take file name and replace extension by empty string
              let trackNb = tags.track ? `${tags.track.toString().match(/[^/]+/)}`.padStart(2, "0") : "01"; // if track number undefined puts 01 otherwise takes only string before "/" if there's any and if string doesn't have at least 2 numbers then adds leading zero
              let songAlbum = tags.album ? `${tags.album}` : "Unknown";
              let artist = tags.artist ? `${tags.artist}` : "Unknown";
              let albumYear = tags.year ? `${tags.year}` : "Unknown";
              let albumGenre = tags.genre ? `${tags.genre}` : "Unknown";

              let duration = audioEl.duration;

              liEl.setAttribute("data-track", trackNb);
              audioEl.muted = true;

              durationEl.textContent = convertSeconds(duration);
              trackEl.textContent = trackNb + ".";

              titleEl.setAttribute("data-artist", artist);
              titleEl.textContent = songTitle;

              liEl.appendChild(audioEl); // add <audio> with src
              liEl.appendChild(trackEl); // add <span> with track number
              liEl.appendChild(titleEl); // add <div> with title
              liEl.appendChild(durationEl); // add <span> with duration
              liEl.addEventListener("dblclick", handleUlClick);

              /* 3 options :
                  - song album is unknown - add to the Album with data-album="unknown" and remove .hidden class to display it
                  - song album was already added - add song to the the existing Album with data-album="old-Album"
                  - song album is a new one - create new Album <div> with data-album="new-album" */

              if (songAlbum === "Unknown") {
                let unknownAlbumContainer = document.querySelector(".album[data-album='unknown']");

                if (unknownAlbumContainer && unknownAudioList) {
                  unknownAlbumContainer.classList.remove("hidden");
                  unknownAudioList.appendChild(liEl);
                }
              } else if (songAlbum) {
                let albumsContainers = document.querySelector(`.album[data-album='${songAlbum}']`);

                if (albumsContainers) {
                  let ulList = albumsContainers.getElementsByTagName("ul")[0];
                  let songsList = ulList.getElementsByClassName("song");

                  let trackNbArray = [];

                  for (let j = 0; j < songsList.length; j++) {
                    let trackNumbers = songsList[j].getAttribute("data-track");
                    trackNbArray.push(trackNumbers);
                  }

                  trackNbArray.push(trackNb);
                  trackNbArray.sort();

                  let indexToAppend = trackNbArray.indexOf(trackNb);

                  let albumIndex = songs
                    .map((e) => {
                      return e.albumTitle;
                    })
                    .indexOf(songAlbum);

                  let songsInObjects = songs[albumIndex].liElements;

                  if (indexToAppend === 0 && songsInObjects) {
                    ulList.insertBefore(liEl, songsList[0]);
                    songsInObjects.splice(0, 0, liEl);
                  } else if (songsList[indexToAppend] && songsInObjects) {
                    ulList.insertBefore(liEl, songsList[indexToAppend]);
                    songsInObjects.splice(indexToAppend, 0, liEl);
                  } else {
                    ulList.appendChild(liEl);

                    if (songsInObjects) {
                      songsInObjects.push(liEl);
                    }
                  }
                } else {
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

                  /**
                   * * Set classes
                   */

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

                  if (tags.picture) {
                    const byteArray = new Uint8Array(tags.picture.data);
                    const blob = new Blob([byteArray], { type });
                    const albumArtUrl = URL.createObjectURL(blob);
                    albumImageEl.src = albumArtUrl;
                    // albumImageEl.onload = function() {
                    //    URL.revokeObjectURL(albumArtUrl);
                    // }
                  } else {
                    albumImageEl.classList.add("noAlbumCover");
                    albumImageEl.src = UnknownImage;
                  }

                  albumContainerEl.setAttribute("data-album", songAlbum);
                  bandNameEl.textContent = artist;
                  titleDivEl.textContent = songAlbum;
                  albumYearEl.textContent = albumYear;
                  albumGenreEl.textContent = albumGenre;
                  albumInfoEl.addEventListener("dblclick", displayHideList);

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

                  songs.push({ albumTitle: songAlbum, liElements: [liEl] });
                }
              } else {
                alert("Error");
              }
            },
            onError: function (error) {
              alert("Something went wrong " + error.info + " " + error.type);
            },
          });
        };
      }
    }
  }

  function displayHideList(e: MouseEvent) {
    let currentTarget = e.currentTarget as HTMLDivElement;
    let audioList = currentTarget.nextElementSibling;

    if (!audioList) {
      alert("It appears that list is gone, what have you done");
    } else {
      if (audioList.classList.contains("hidden")) {
        audioList.classList.remove("hidden");
      } else {
        audioList.classList.add("hidden");
      }
    }
  }

  function handleUlClick(e: MouseEvent) {
    let currentTarget = e.currentTarget as HTMLLIElement;

    if (currentTarget && currentTarget.nodeName === "LI") {
      console.log(isReady);
      let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;
      let audio = currentTarget.getElementsByTagName("audio")[0];

      let playbarDuration = document.getElementsByClassName("duration")[0];

      let songName = currentTarget.getElementsByClassName("song__title")[0];
      let artist = songName.getAttribute("data-artist");

      playlist = [];

      songs.forEach(function (song) {
        playlist = playlist.concat(...(song.liElements as Array<HTMLLIElement>));
      });

      console.log(playlist);

      if (mainAudio.src) {
        mainAudio.src = audio.src;
        mainAudio.load();
        mainAudio.play();

        setIsPlaying(true);
      } else {
        mainAudio.src = audio.src;
        mainAudio.load();
        mainAudio.play();

        setIsPlaying(true);
      }

      let previousLi = document.querySelector(".nowPlaying");

      if (previousLi) {
        previousLi.classList.remove("nowPlaying");
      }

      currentTarget.classList.add("nowPlaying");

      playbarDuration.textContent = convertSeconds(audio.duration);

      if (songName.textContent) {
        document.title = artist + " - " + songName.textContent;
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
        onChange={(e) => {
          openFiles(e);
        }}
        className="openFiles-input"
        type="file"
        multiple
        ref={openInput_ref}
      />
      <input accept="audio/*" className="addFiles-input" type="file" multiple ref={addInput_ref} />

      <LeftPane index={activeIndex} handleInputs={handleInputsClick} />
      <RightPane />

      <Playbar isPlaying={isPlaying} />

      <audio id="mainAudio" className="mainAudio" />
    </div>
  );
};

export default App;
