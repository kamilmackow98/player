import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";

import React, { ChangeEvent } from "react";
import jsmediatags from "jsmediatags";

import UnknownImage from "./images/unknown.png";
import "./sass/app.scss";

/**
 * TODO : add color text + icons in panes as the variable theme ($third variable)
 * TODO : add checkbox/button to toggle album reflection ON/OFF
 * TODO : check file types
 * TODO : set index on [Album] tab after opening the files
 * TODO : button with sort function to sort albums by ARTIST NAME in playlist from A to Z
 * TODO : in openFiles() instead of opening and creatingObjectURL album cover / picture from every audio file - get from the first file with track number === 01
 * TODO : add condition to check if audio / song already exists (maybe)
 * TODO : add keyboard shortcuts (Play-Pause on spacebar | Next-Previous maybe Ctrl+L and Ctrl+J)
 * TODO : change context menu (right click) AND prevent F12 or global right click
 * TODO : add EventListener to hide list of UnknownAlbum
 *
 * ! Event delegation apparently is discouraged in React. React handles it on its own so each <li> has EventListener
 */

interface fileInfo {
  trackNb: string;
  songTitle: string;
  songAlbum: string;
  albumGenre: string;
  albumYear: string;
  artist: string;
  picture?: any;
  type: string;
}

interface Songs {
  albumTitle?: string;
  liElements?: Array<HTMLLIElement>;
}

/* needed to be put before const App otherwise with each render will reset the variable */
let songs: Array<Songs> = [];
let playlist: Array<HTMLLIElement> = [];

export const App = () => {
  const [activeIndex, setIndex] = React.useState(0); // initial index set to 0 - File Tab
  const [isPlaying, setIsPlaying] = React.useState(false); // state to check if audio is playing
  const [isMuted, setIsMuted] = React.useState(false); // state to check if main audio is muted

  const openInput_ref = React.useRef<HTMLInputElement>(null); // input to open new files
  const addInput_ref = React.useRef<HTMLInputElement>(null); // input to add files to the playlist

  let objectUrl: string; // variable to store url objects

  /* -------------------------------------------- */
  /* --------| simply changes the index |-------- */
  /* -------------------------------------------- */
  const handleIndex = (index: number) => {
    setIndex(index);
  };

  function muteAudio() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;

    if (!mainAudio.muted) {
      mainAudio.muted = true;
      setIsMuted(true);
    } else {
      mainAudio.muted = false;
      setIsMuted(false);
    }
  }

  /* --------------------------------------------------- */
  /* --------| simulates mouse click on inputs |-------- */
  /* --------------------------------------------------- */
  function handleInputsClick(event: React.MouseEvent) {
    /* checks first which button is clicked then simulates mouse click on input */
    if (event.currentTarget.classList.contains("open-files") && openInput_ref.current) {
      openInput_ref.current.click();
    } else if (event.currentTarget.classList.contains("add-files") && addInput_ref.current) {
      addInput_ref.current.click();
    }
  }

  /* ------------------------------------------------------ */
  /* --------| Main useEffect with some functions |-------- */
  /* ------------------------------------------------------ */
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

  /* fire on change when user opens files */
  async function openFiles(event: ChangeEvent): Promise<{ done: boolean }> {
    let rightPaneContent = document.getElementsByClassName("right-pane__content")[0] as HTMLDivElement; // container with all [albums] <div>
    let allAlbumsNotUnkown = document.querySelectorAll(".album:not(.unknown)"); // get all the albums but not unknown
    let target = event.currentTarget as HTMLInputElement; // current input [openFiles]
    let audioFiles = target.files; // files from the input
    let unknownAudioList = document.querySelector(".album[data-album='unknown'] .audio__list");

    rightPaneContent.classList.add("noTouching"); // prevent user from clicking too fast

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

    songs = [];
    playlist = [];

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
          durationEl.textContent = convertSeconds(audioEl.duration);
        };

        let fileInfo = await readFileInfo(audioFiles[i])
          .then((tagInfo) => {
            return tagInfo as fileInfo;
          })
          .catch((error) => {
            console.log(error);
            return error;
          });

        const { trackNb, songTitle, songAlbum, albumGenre, albumYear, artist, picture, type } = fileInfo;

        audioEl.muted = true;
        liEl.setAttribute("data-track", trackNb);
        trackEl.textContent = trackNb + ".";
        titleEl.setAttribute("data-artist", artist);
        titleEl.textContent = songTitle === "Unknown" ? `${audioFiles[i].name.replace(/\.[^/.]+$/, "")}` : songTitle;

        liEl.appendChild(audioEl); // add <audio> with src
        liEl.appendChild(trackEl); // add <span> with track number
        liEl.appendChild(titleEl); // add <div> with title
        liEl.appendChild(durationEl); // add <span> with duration
        liEl.addEventListener("dblclick", handleLiClick);

        /* 3 options :
                  - song album is unknown - add to the Album with data-album="unknown" and remove .hidden class to display it
                  - song album was already added - add song to the the existing Album with data-album="old-album"
                  - song album is a new one - create new Album <div> with data-album="new-album" */

        /* 1st option - if [Album] is unknown */
        if (songAlbum === "Unknown") {
          let unknownAlbumContainer = document.querySelector(".album[data-album='unknown']");

          if (unknownAlbumContainer && unknownAudioList) {
            unknownAlbumContainer.classList.remove("hidden");
            unknownAudioList.appendChild(liEl);
          }

          if (songs.length) {
            let indexToAppendUnknown = songs
              .map((e) => {
                return e.albumTitle;
              })
              .indexOf("Unknown");

            if (indexToAppendUnknown === -1) {
              songs.unshift({ albumTitle: "Unknown", liElements: [liEl] });
            } else {
              let unknownSongs = songs[indexToAppendUnknown].liElements as Array<HTMLLIElement>;
              unknownSongs.push(liEl);
            }
          } else {
            songs.push({ albumTitle: "Unknown", liElements: [liEl] });
          }

          /* 2 other options only if title of [Album] isn't undefined */
        } else if (songAlbum) {
          let albumsContainers = document.querySelector(`.album[data-album='${songAlbum}']`); // gets div with same album as the current file

          /* 2nd option - if [Album] already exists */
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
            /* 3rd option - create new [Album] since it's neither Unknown neither existing already */

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

            if (picture) {
              const byteArray = new Uint8Array(picture.data);
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

            /* add to the array of LiElements with songs */
            songs.push({ albumTitle: songAlbum, liElements: [liEl] });
          }
        } else {
          alert("Error. Something went wrong");
        }
      }
    }
    return new Promise((resolve, reject) => {
      resolve({ done: true });
      reject({ error: "Something went wrong" });
    });
  }

  /* --------------------------------------------------------- */
  /* --------| Fires when clicked on [Open files...] |-------- */
  /* --------------------------------------------------------- */
  async function inputOpen(event: ChangeEvent) {
    /* executes openFiles() and waits for it to be done */
    await openFiles(event)
      .then((isDone) => {
        if (isDone) {
          /* when Promise resolved and openFiles() is done
          removes class added in openFiles() that 
          prevents user to click any <li> before it's fully executed */
          let rightPaneContent = document.querySelector(".right-pane__content") as HTMLDivElement;
          rightPaneContent.classList.remove("noTouching");

          /* gets every <li> element from Array[Songs] (and only <li>)
          and puts them in Array[Playlist] in same order as in [Songs] */
          songs.forEach(function (song) {
            playlist = playlist.concat(...(song.liElements as Array<HTMLLIElement>));
          });
        }
      })
      .catch((error) => {
        alert("Something went wrong " + error);
        console.log(error);
      });
  }

  /* -------------------------------------------------------- */
  /* --------| Fires when clicked on [Add files...] |-------- */
  /* -------------------------------------------------------- */
  async function inputAdd(event: ChangeEvent) {
    let songsDOM = document.querySelectorAll(".song"); // gets every <li class="song">

    /* if there's no songs in DOM - will execute as if user clicked on [Open files...]
       otherwise executes addFiles() and waits for it to be done */
    if (!songsDOM.length) {
      inputOpen(event);
    } else {
      console.log(songsDOM);
    }
  }

  /* ----------------------------------------------------- */
  /* --------| Play Previous audio from playlist |-------- */
  /* ----------------------------------------------------- */
  function previous() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // main <audio>

    /* if playlist contains audios and any song is already loaded */
    if (playlist.length > 0 && mainAudio.src) {
      let currentPlaying = document.querySelector(".nowPlaying") as HTMLLIElement; // current song that was/is selected
      let indexOfCurrent = playlist.indexOf(currentPlaying); // get index of current audio in the playlist

      /* if reaches beginning of the playlist plays the last audio
         otherwise plays previous audio from the playlsit */
      if (indexOfCurrent === 0) {
        console.log("index is 0");
      } else {
        let previousIndex = playlist[indexOfCurrent - 1]; // gets previous index (current - 1)
        let previousAudio = previousIndex.getElementsByTagName("audio")[0]; // retrieves previous audio from playlist

        playNextOrPrevious(mainAudio, previousAudio, currentPlaying, previousIndex);
      }
    }
  }

  /* ------------------------------------------------- */
  /* --------| Play Next audio from playlist |-------- */
  /* ------------------------------------------------- */
  function next() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // main <audio>

    /* if playlist contains audios and any song is already loaded */
    if (playlist.length > 0 && mainAudio.src) {
      let currentPlaying = document.querySelector(".nowPlaying") as HTMLLIElement; // current song that was/is selected
      let indexOfCurrent = playlist.indexOf(currentPlaying); // get index of current audio in the playlist

      /* if reaches end of the playlist plays the first audio
         otherwise plays next audio from the playlsit */
      if (indexOfCurrent === playlist.length - 1) {
        console.log("end of playlist");
      } else {
        let nextIndex = playlist[indexOfCurrent + 1]; // gets next index (current + 1)
        let nextAudio = nextIndex.getElementsByTagName("audio")[0]; // retrieves next audio from playlist

        playNextOrPrevious(mainAudio, nextAudio, currentPlaying, nextIndex);
      }
    }
  }

  /* ----------------------------------------------------------- */
  /* --------| Checks if prev/next audio can be played |-------- */
  /* -----------| and loads media then plays audio |------------ */
  /* ----------------------------------------------------------- */
  function playNextOrPrevious(
    mainAudio: HTMLAudioElement,
    nextPrevAudio: HTMLAudioElement,
    curPlayingEl: HTMLLIElement,
    nextOrPrevEl: HTMLLIElement
  ) {
    /* since play() returns a promise - first checks if promise isn't undefined so it can load media
       then checks again if it can actually play the loaded src */
    let playPromise = mainAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then((_) => {
          let playbarDuration = document.getElementsByClassName("duration")[0]; // duration element in the App

          /* update audio duration for prev/next 
             update audio src from prev/next and load it */
          playbarDuration.textContent = convertSeconds(nextPrevAudio.duration);
          mainAudio.src = nextPrevAudio.src;
          mainAudio.load();

          /* remove indicator from current playing and add to the prev/next */
          curPlayingEl.classList.remove("nowPlaying");
          nextOrPrevEl.classList.add("nowPlaying");

          if (playPromise !== undefined) {
            playPromise
              .then((_) => {
                mainAudio.play();
              })
              .catch((error) => {
                alert("Something went wrong " + error);
                console.log(error);
              });
          }
        })
        .catch((error) => {
          alert("Something went wrong " + error);
          console.log(error);
        });
    }
  }

  /* ------------------------------------------------------------- */
  /* --------| Plays selected audio from <li> on dbClick |-------- */
  /* ------------------------------------------------------------- */
  function handleLiClick(event: MouseEvent) {
    let currentTarget = event.currentTarget as HTMLLIElement; // currentTarget so only <li> no child elements

    /* only fires when <li> is dbClicked */
    if (currentTarget && currentTarget.nodeName === "LI") {
      let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // gets main <audio>
      let playbarDuration = document.getElementsByClassName("duration")[0]; // gets duration element
      let previousLi = document.querySelector(".nowPlaying"); // gets

      let currentAudio = currentTarget.getElementsByTagName("audio")[0]; // gets <audio> from selected <li> element
      let songName = currentTarget.getElementsByClassName("song__title")[0]; // gets <div> with song name
      let artist = songName.getAttribute("data-artist"); // gets artist name from data attribute

      mainAudio.src = currentAudio.src; // gets src from selected audio
      mainAudio.load(); // loads the audio

      let playPromise = mainAudio.play();

      /* checks if promise isn't undefined after new src load and then plays audio */
      if (playPromise !== undefined) {
        playPromise.then((_) => {
          mainAudio.play();
          setIsPlaying(true);
        });
      }

      /* removes indicator from previous <li> selection if there is any */
      if (previousLi) {
        previousLi.classList.remove("nowPlaying");
      }

      playbarDuration.textContent = convertSeconds(currentAudio.duration); // sets current duration in DOM
      currentTarget.classList.add("nowPlaying"); // adds indicator on current <li>

      document.title = artist + " - " + songName.textContent; // sets the title of document to the current song
    }
  }

  /* -------------------------------------------------- */
  /* --------| Hides or shows <ul> on dbClick |-------- */
  /* -------------------------------------------------- */
  function displayHideList(event: MouseEvent) {
    let currentTarget = event.currentTarget as HTMLDivElement; // <div class="album__info">
    let audioList = currentTarget.nextElementSibling; // <ul> is the next sibling element

    /* toggle class to Hide | Show <ul> */
    if (audioList) {
      if (audioList.classList.contains("hidden")) {
        audioList.classList.remove("hidden");
      } else {
        audioList.classList.add("hidden");
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /* --------| Reads info from media file (track, artist, album etc.) |-------- */
  /* -------------------------------------------------------------------------- */
  function readFileInfo(file: File) {
    return new Promise((resolve, reject) => {
      jsmediatags.read(file, {
        onSuccess: function (tag) {
          let type = tag.type;
          let tags = tag.tags;

          /* checks for every info if exists otherwise sets it to "Unknown" */
          /* if track number is undefined sets track number as 01 insted
          otherwise takes only track number before "/" if there's any slash
          and if string has only 1 digit then adds leading zero */
          /* picture's type isn't a string so if it's undefined 
          it will be replaced later by default image */
          let trackNb = tags.track ? `${tags.track.toString().match(/[^/]+/)}`.padStart(2, "0") : "01";
          let songTitle = tags.title ? `${tags.title}` : "Unknown";
          let songAlbum = tags.album ? `${tags.album}` : "Unknown";
          let albumGenre = tags.genre ? `${tags.genre}` : "Unknown";
          let albumYear = tags.year ? `${tags.year}` : "Unknown";
          let artist = tags.artist ? `${tags.artist}` : "Unknown";
          let picture = tags.picture;

          /* creates fileInfo object */
          let mediaInfo: fileInfo = {
            trackNb: trackNb,
            songTitle: songTitle,
            songAlbum: songAlbum,
            albumGenre: albumGenre,
            albumYear: albumYear,
            artist: artist,
            picture: picture,
            type: type,
          };

          /* onSucces returns object with info from media file */
          resolve(mediaInfo);
        },
        onError: function (error) {
          reject("Error in JSMediaTags \nError info: " + error.info + "\nError type: " + error.type);
        },
      });
    });
  }

  /* -------------------------------------------------------------- */
  /* --------| Returns duration in sec in HH:MM:SS format |-------- */
  /* -------------------------------------------------------------- */
  function convertSeconds(duration: number) {
    let hours, minutes, seconds;

    /* converts duration into Hours | Minutes | Seconds 
    and adds leading zero if there's only 1 digit */
    hours = (Math.floor(duration / 3600) % 60).toString().padStart(2, "0");
    minutes = (Math.floor(duration / 60) % 60).toString().padStart(2, "0");
    seconds = Math.floor(duration % 60)
      .toString()
      .padStart(2, "0");

    /* if duration >= 1H returns also HH otherwise returns only MM:SS */
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
          inputOpen(e);
        }}
        className="openFiles-input"
        type="file"
        multiple
        ref={openInput_ref}
      />
      <input
        accept="audio/*"
        onChange={(e) => {
          inputAdd(e);
        }}
        className="addFiles-input"
        type="file"
        multiple
        ref={addInput_ref}
      />

      <LeftPane index={activeIndex} handleInputs={handleInputsClick} />
      <RightPane />

      <Playbar isPlaying={isPlaying} previous={previous} next={next} mute={muteAudio} isMuted={isMuted} />

      <audio id="mainAudio" className="mainAudio" onEnded={next} />
    </div>
  );
};

export default App;
