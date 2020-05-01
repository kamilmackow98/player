import RightPane from "./components/RightPane";
import LeftPane from "./components/LeftPane";
import Playbar from "./components/Playbar";
import Navbar from "./components/Navbar";

import React, { ChangeEvent } from "react";
import jsmediatags from "jsmediatags";

import UnknownImage from "./images/unknown.png";
import "./sass/app.scss";

/**
 * TODO : right click context menu - maybe in future add some options like (delete song / <li> etc.)
 * TODO : --> OR when adding files check also for the ARTIST and ALBUM not only ALBUM
 * TODO : --> function to sort albums by ARTIST then by ALBUM on adding files
 *
 * ! Event delegation apparently is discouraged in React. React handles it on its own. So each <li> has an EventListener
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
let songs: Array<Songs> = []; // songs array -> Array of objects {"albumTitle", [ArrayOfLi]}
let playlist: Array<HTMLLIElement> = []; // playlist array -> only <li> elements
let shuffledPlaylist: Array<HTMLLIElement> = []; // same as playlist but random songs

export const App = () => {
  const [activeIndex, setIndex] = React.useState(0); // initial index set to 0 - File Tab
  const [isPlaying, setIsPlaying] = React.useState(false); // state to check if audio is playing
  const [isMuted, setIsMuted] = React.useState(false); // state to check if main audio is muted
  const [isLooped, setIsLooped] = React.useState(false); // state to check if main audio should repeat the song
  const [isShuffled, setIsShuffled] = React.useState(false); // state to check if playlist is shuffled

  let isShuffledRef = React.useRef<boolean>();
  const openInput_ref = React.useRef<HTMLInputElement>(null); // input to open new files
  const addInput_ref = React.useRef<HTMLInputElement>(null); // input to add files to the playlist

  let objectUrl: string; // variable to store url objects

  /* ------------------------------------------------------ */
  /* --------| Main useEffect with some functions |-------- */
  /* ------------------------------------------------------ */
  React.useEffect(() => {
    let progressBar = document.getElementsByClassName("progress-bar")[0] as HTMLSpanElement; // progress bar container
    let lineProgressBar = document.querySelector(".progress-bar .line") as HTMLSpanElement; // line that indicates the progress
    let timestamp = document.getElementsByClassName("timestamp")[0] as HTMLSpanElement; // timestamp with HH:MM:SS / current time

    let currentTimeEl = document.getElementsByClassName("current-time")[0] as HTMLSpanElement; // <span> element with current time
    let play_pause = document.getElementsByClassName("play-pause")[0] as HTMLSpanElement; // play & pause control
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // main <audio> element

    let pane_album = document.getElementById("album") as HTMLDivElement; // main album cover
    let album_width_init = pane_album.offsetWidth; // initial width value

    pane_album.style.height = `${album_width_init}px`; // initialize height = same as width

    /* ------------------------------------------------------------------------------------ */
    /* --------| on timeUpdate changes current time <span> and moves progress bar |-------- */
    /* ------------------------------------------------------------------------------------ */
    function updateProgressBar() {
      currentTimeEl.textContent = convertSeconds(mainAudio.currentTime); // converts seconds from current audio time and puts it in DOM
      let percentage = parseFloat(((mainAudio.currentTime / mainAudio.duration) * 100).toFixed(3)); // (currTime / fullDuration) * 100 = current percentage
      lineProgressBar.style.transform = `translate3d(${-100.2 + percentage}%, 0, 0)`; // updates and moves the line EL according to the percentage
    }

    /* ---------------------------------------------------- */
    /* --------| displays timestamp on mouseEnter |-------- */
    /* ---------------------------------------------------- */
    function progressTimestamp(this: HTMLElement, event: MouseEvent) {
      let x = event.pageX; // gets x coords from left side of the page

      let totalWidth = progressBar.offsetWidth; // width of progress bar
      let percentage = (x - this.offsetLeft) / totalWidth; // gets percentage from progress bar width on current position

      if (mainAudio.src && mainAudio.duration) {
        timestamp.style.display = "flex";
        timestamp.style.transform = `translate3d(calc(-50% + ${x}px), 0, 0)`; // -50% to center timestamp + "x" px from left

        let audioSeconds = mainAudio.duration * percentage; // gets percentage from full audio duration on current position
        timestamp.textContent = convertSeconds(audioSeconds); // converts seconds into HH:MM:SS and puts it in <span>
      }
    }

    /* ----------------------------------------------------------------- */
    /* --------| sets currentTime when clicked on progress bar |-------- */
    /* ----------------------------------------------------------------- */
    function setCurrentTime(this: HTMLElement, event: MouseEvent) {
      /* element distance from the left of the page - distance of element from the beginning of the parent 
      IF PARENT HAS RELATIVE POSITION add "- 100px" because of that left controls that take 100px of space */
      let xCord = event.pageX - this.offsetLeft;

      let totalWidth = progressBar.offsetWidth; // width of progress bar
      let percentage = xCord / totalWidth;

      if (mainAudio.src && mainAudio.duration) {
        let audioSeconds = mainAudio.duration * percentage; // get current seconds / time from percentage of the full audio duration
        mainAudio.currentTime = audioSeconds; // sets current time on <audio> element

        if (mainAudio.paused) {
          setIsPlaying(true);
          mainAudio.play();
        }
      }
    }

    /* ------------------------------------------------------ */
    /* --------| Plays or pauses mainAudio on click |-------- */
    /* ------------------------------------------------------ */
    function togglePlay() {
      /* only if mainAudio has loaded data */
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

    /* --------------------------------------------------------------- */
    /* --------| Plays or pauses mainAudio on spacebar press |-------- */
    /* --------------------------------------------------------------- */
    function spacebarToggle(event: KeyboardEvent) {
      if (event.keyCode === 32 && mainAudio.src) {
        event.preventDefault();
        togglePlay();
      }
    }

    /* ---------------------------------------------------------------- */
    /* --------| Prev Or Next on "J" Or "L" press on keyboard |-------- */
    /* ---------------------------------------------------------------- */
    function keyboardPrevNext(event: KeyboardEvent) {
      if (mainAudio.src) {
        switch (event.keyCode) {
          case 74:
            event.preventDefault();
            previous();
            break;

          case 76:
            event.preventDefault();
            next();
            break;
        }
      }
    }

    /* ----------------------------------------------------------------------------- */
    /* --------| when mainAudio is / starts playing sets isPlaying to true |-------- */
    /* ----------------------------------------------------------------------------- */
    function play() {
      setIsPlaying(true);
    }

    /* -------------------------------------------------------------------- */
    /* --------| when mainAudio is paused sets isPlaying to false |-------- */
    /* -------------------------------------------------------------------- */
    function pause() {
      setIsPlaying(false);
    }

    /* ---------------------------------------------------- */
    /* --------| onMouseLeave hides the timestamp |-------- */
    /* ---------------------------------------------------- */
    function hideTimestamp() {
      timestamp.style.display = "none";
    }

    /* -------------------------------------------------- */
    /* --------| keeps aspect ratio on resizing |-------- */
    /* -------------------------------------------------- */
    function ratio() {
      let album_width = pane_album.offsetWidth; // gets album width
      pane_album.style.height = `${album_width}px`; // sets height
    }

    /**
     * * Adds event listeners on components mount
     */
    window.addEventListener("keydown", spacebarToggle);
    window.addEventListener("keydown", keyboardPrevNext);

    progressBar.addEventListener("mousemove", progressTimestamp);
    progressBar.addEventListener("mouseleave", hideTimestamp);
    progressBar.addEventListener("click", setCurrentTime);

    mainAudio.addEventListener("timeupdate", updateProgressBar);
    mainAudio.addEventListener("pause", pause);
    mainAudio.addEventListener("play", play);

    play_pause.addEventListener("click", togglePlay);
    window.addEventListener("resize", ratio);

    /**
     * * On components unmount - event listeners cleanup
     */
    return function cleanupListener() {
      window.removeEventListener("keydown", spacebarToggle);
      window.removeEventListener("keydown", keyboardPrevNext);

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

  /* -------------------------------------------------------------- */
  /* --------| useEffect only if isShuffled state changes |-------- */
  /* -------------------------------------------------------------- */
  React.useEffect(() => {
    shufflePlaylist();

    isShuffledRef.current = isShuffled;

    /* --------------------------------------------- */
    /* --------| shuffle playlist function |-------- */
    /* --------------------------------------------- */
    function shufflePlaylist() {
      /* only if state (isShuffled) true */
      if (isShuffled) {
        shuffledPlaylist = []; // reset the array
        // shuffledPlaylist = playlist.slice(0); // copy each element from playlist to shuffledPlaylist
        shuffledPlaylist = [...playlist];

        /* shuffle the array */
        for (let i = shuffledPlaylist.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * i);
          const temp = shuffledPlaylist[i];
          shuffledPlaylist[i] = shuffledPlaylist[j];
          shuffledPlaylist[j] = temp;
        }
      }
    }
  }, [isShuffled]);

  /* -------------------------------------------- */
  /* --------| simply changes the index |-------- */
  /* -------------------------------------------- */
  const handleIndex = (index: number) => {
    setIndex(index);
  };

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

  /* --------------------------------------------- */
  /* --------| simply changes loop state |-------- */
  /* --------------------------------------------- */
  function loopAudio() {
    setIsLooped(!isLooped);
  }

  /* ----------------------------------------- */
  /* --------| changes shuffle state |-------- */
  /* ----------------------------------------- */
  function shuffle() {
    /* only if there are elements in playlist Array */
    if (playlist.length > 0) {
      setIsShuffled(!isShuffled);
    }
  }

  /* ---------------------------------------------- */
  /* --------| mutes or unmutes mainAudio |-------- */
  /* ---------------------------------------------- */
  function muteAudio() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;

    /* if mainAudio element isn't mute - mutes the audio and changes the state */
    if (!mainAudio.muted) {
      mainAudio.muted = true;
      setIsMuted(true);
    } else {
      mainAudio.muted = false;
      setIsMuted(false);
    }
  }

  /* -------------------------------------------------------------- */
  /* --------| clears src, currentTime, progress bar etc. |-------- */
  /* -------------------------------------------------------------- */
  function clearMainAudio() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;
    let duration = document.getElementsByClassName("duration")[0];
    let currentT = document.getElementsByClassName("current-time")[0];
    let line = document.querySelector(".progress-bar .line") as HTMLSpanElement;

    setIsShuffled(false); // reset shuffled

    if (mainAudio.src) {
      let playPromise = mainAudio.play(); // promise returned from play()

      /* proper way to clear audio */
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(false);
          mainAudio.pause();

          mainAudio.setAttribute("src", ""); // clear src
          mainAudio.removeAttribute("src"); // remove src attribute completely
          line.style.transform = "translate3d(-100.2%, 0, 0)"; // reset line on progress bar

          /* resets current time and duration text */
          /* needed to add timeout because mainAudio has
          eventListener on timeupdate and it isn't sometimes
          100% done so currentTime text changes to 00:00 */
          setTimeout(() => {
            duration.textContent = "-- : --";
            currentT.textContent = "-- : --";
          }, 250);
        });
      }
    }
  }

  /* --------------------------------------------------------- */
  /* --------| clears / resets app to default state  |-------- */
  /* --------------------------------------------------------- */
  function resetApp() {
    let rightPaneContent = document.getElementsByClassName("right-pane__content")[0] as HTMLDivElement; // container with all [albums] <div>
    let allAlbumsNotUnknown = document.querySelectorAll(".album:not(.unknown)"); // gets all the albums but not unknown
    let globalAlbumArt = document.getElementById("album") as HTMLDivElement; // gets main cover art from Album TAB

    let unknownAudioList = document.querySelector(".album[data-album='unknown'] .audio__list"); // gets <ul> from unknown album
    let unknownAlbum = document.querySelector(".album[data-album='unknown']"); // gets unknown album

    rightPaneContent.classList.add("noTouching"); // prevent user from clicking too fast when opening new files

    /* removes every DOM <li> from "unknown" <ul> */
    if (unknownAudioList && unknownAlbum) {
      while (unknownAudioList!.firstChild) {
        unknownAudioList!.removeChild(unknownAudioList!.firstChild);
      }
      unknownAlbum.classList.add("hidden"); // hides the unknown album <div>
    }

    /* if right pane has already files from previous selection or some magically appear
       checks if there's any <div> with "album" class but not the hidden unknown album */
    if (allAlbumsNotUnknown.length) {
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
        URL.revokeObjectURL(oldAudio.src);
      }
    }

    /* removes each album <div> from right pane content */
    allAlbumsNotUnknown.forEach(function (child) {
      rightPaneContent.removeChild(child);
    });

    globalAlbumArt.setAttribute("data-cover", "false"); // data attribute for the CSS rules (border, shadows etc.)
    globalAlbumArt.style.backgroundImage = ""; // clears global cover art image

    document.title = "Music Player"; // default doc title

    clearMainAudio();
    resetLyrics();

    songs = []; // clears songs array
    playlist = []; // clears playlist array
  }

  /* --------------------------------------------------------------- */
  /* --------| adds all the info and data from files in DOM|-------- */
  /* --------------------------------------------------------------- */
  async function addFiles(audioFiles: FileList): Promise<{ done: boolean }> {
    let rightPaneContent = document.getElementsByClassName("right-pane__content")[0] as HTMLDivElement; // container with all [albums] <div>
    // let target = event.currentTarget as HTMLInputElement; // current Input element
    // let audioFiles = target.files; // files from input

    /* first checks if there's any file */
    if (!audioFiles || !audioFiles.length) {
      alert("No files selected");
    } else {
      /* for each audio file */
      for (let i = 0; i < audioFiles.length; i++) {
        let file = audioFiles[i]; // current iteration file
        let fileType = file.type; // gets type from each file;

        let indexOfLastDot = file.name.lastIndexOf("."); // last dot to get the extension
        let extension = file.name.substring(indexOfLastDot).toLowerCase(); // gets only .extension and converts it to lowercase

        /* checks if file is actually an audio file */
        // if (!(fileType === "audio/mp3" || fileType === "audio/mpeg")) {
        if (!(fileType === "audio/mp3" || fileType === "audio/mpeg") && !(extension === ".mp3")) {
          alert("Wrong or unsupported file format");
        } else {
          /* creates default elements that will go inside <li> element */
          const durationEl = document.createElement("span");
          const audioEl = document.createElement("audio");
          const trackEl = document.createElement("span");
          const titleEl = document.createElement("div");
          const liEl = document.createElement("li");

          /**
           * ---------------------------------
           * * Sets className for each element
           * ---------------------------------
           */

          durationEl.classList.add("song__duration");
          audioEl.classList.add("song__audio");
          titleEl.classList.add("song__title");
          trackEl.classList.add("track-nb");
          liEl.classList.add("song");

          // creates blob string for each imported audio file and adds src for each <audio>
          objectUrl = URL.createObjectURL(file);
          audioEl.setAttribute("src", objectUrl);

          /* when data (mainly duration) loads from file
          sets the duration of audio in HTML  */
          audioEl.onloadedmetadata = function () {
            durationEl.textContent = convertSeconds(audioEl.duration);
          };

          /* reads info from media file 
          then returns a promise with all info */
          let fileInfo = await readFileInfo(file)
            .then((tagInfo) => {
              return tagInfo as fileInfo;
            })
            .catch((error) => {
              alert("Something went wrong reading the file info");
              console.log(error);
              return error;
            });

          const { trackNb, songTitle, songAlbum, albumGenre, albumYear, artist, picture, type } = fileInfo;

          audioEl.muted = true; // prevent every single <audio> EL from playing in any way
          liEl.setAttribute("data-track", trackNb); // sets attribute with track nb on <li>
          liEl.setAttribute("data-album", songAlbum); // sets attribute with album title on <li>
          titleEl.setAttribute("data-artist", artist); // sets attribute with artist inside <li> EL

          trackEl.textContent = trackNb + "."; // puts track nb in HTML eg. 05. etc
          titleEl.textContent = songTitle === "Unknown" ? `${file.name.replace(/\.[^/.]+$/, "")}` : songTitle; // checks if title isn't unknown

          /**
           * ------------------------------------
           * * Appends inside elements to <li> EL
           * ------------------------------------
           */

          liEl.appendChild(audioEl); // adds <audio> with src
          liEl.appendChild(trackEl); // adds <span> with track number
          liEl.appendChild(titleEl); // adds <div> with title
          liEl.appendChild(durationEl); // adds <span> with duration

          /* eventListener to handle double click on <li> */
          liEl.addEventListener("dblclick", handleLiClick);

          /**
           * * 3 OPTIONS :
           * ? song album is unknown - adds to the Album with data-album="unknown" and removes .hidden class to display it
           * ? song album was already added - adds song to the the existing Album with data-album="old-album"
           * ? song album is a new one - creates new Album <div> with data-album="new-album"
           */

          /* ------------------------------------ */
          /* ---| 1st option - Album unknown |--- */
          /* ------------------------------------ */
          if (songAlbum === "Unknown") {
            let unknownAlbumContainer = document.querySelector(".album[data-album='unknown']"); // selects only unknown <div> album
            let unknownAudioList = document.querySelector(".album[data-album='unknown'] .audio__list"); // selects <ul> inside unknown album

            if (unknownAlbumContainer && unknownAudioList) {
              unknownAlbumContainer.classList.remove("hidden"); //shows the hidden album <div>
              unknownAudioList.appendChild(liEl); // appends <li> inside <ul> list
            }

            /* checks if songs[] has elements inside the array
            if has elements gets index to append new <li> inside <ul>
            else just adds new <li> inside <ul> in unknown album <div> */
            if (songs.length) {
              /* retrieves indexOf unknown album from songs[] */
              let indexToAppendUnknown = songs
                .map((e) => {
                  return e.albumTitle; // returns each albumTitle from songs[]
                })
                .indexOf("Unknown");

              /* conditions to check where to place the <li> EL */
              if (indexToAppendUnknown === -1) {
                /* if -1 it means it doesn't exists yet so creates first album object at the beginning of songs[] */
                songs.unshift({ albumTitle: "Unknown", liElements: [liEl] });
              } else {
                /* adds new <li> to the songs[] at returned index (where "Unknown" album object is located) */
                let unknownSongs = songs[indexToAppendUnknown].liElements as Array<HTMLLIElement>;
                unknownSongs.push(liEl);
              }
            } else {
              songs.push({ albumTitle: "Unknown", liElements: [liEl] });
            }

            /* only if album title is NOT undefined */
          } else if (songAlbum) {
            /* gets div with same album as the one from current audio file */
            /* replace function escapes dobule quotes if a album title contains any */
            let albumContainer = document.querySelector(
              `.album[data-album="${songAlbum.replace(/\\([\s\S])|(")/g, "\\$1$2")}"]`
            );

            /* ---------------------------------------------- */
            /* ---| 2nd option - if Album already exists |--- */
            /* ---------------------------------------------- */
            if (albumContainer) {
              let ulList = albumContainer.getElementsByTagName("ul")[0]; // gets <ul> from selected <div> album
              let songsList = ulList.getElementsByClassName("song"); // gets every <li> from <ul>

              let trackNbArray = []; // new array which will contain track numbers

              for (let j = 0; j < songsList.length; j++) {
                let trackNumbers = songsList[j].getAttribute("data-track"); // gets only track number from each <li>
                trackNbArray.push(trackNumbers); // adds every one of them into array
              }

              trackNbArray.push(trackNb); // adds current trackNb to the array
              trackNbArray.sort(); // sorts array of numbers

              let indexToAppend = trackNbArray.indexOf(trackNb); // gets index of the current track nb from the array

              /* gets indexOf current album from songs[] */
              let albumIndex = songs
                .map((e) => {
                  return e.albumTitle; // returns each albumTitle from songs[]
                })
                .indexOf(songAlbum);

              let liInCurrentAlbum = songs[albumIndex].liElements; // gets every <li> from album at returned index

              /* conditions to check where should the new <li> be inserted in DOM and added in songs[] */
              if (indexToAppend === 0 && liInCurrentAlbum) {
                ulList.insertBefore(liEl, songsList[0]); // appends <li> at the begginning of <ul>
                liInCurrentAlbum.splice(0, 0, liEl); // adds new <li> at the beggining of songs[]
              } else if (songsList[indexToAppend] && liInCurrentAlbum) {
                ulList.insertBefore(liEl, songsList[indexToAppend]); // appends at the returned index
                liInCurrentAlbum.splice(indexToAppend, 0, liEl); // adds <li> at returned index in songs[]
              } else {
                ulList.appendChild(liEl); // appends <li> at the end of the <ul>

                if (liInCurrentAlbum) {
                  liInCurrentAlbum.push(liEl); // adds <li> at the end of songs[]
                }
              }
            } else {
              /* ---------------------------------------------- */
              /* ---| 3rd option - creates new Album <div> |--- */
              /* ---------------------------------------------- */

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

              /* check for album cover / art */
              /* picture.data returns an array of data */
              if (picture) {
                const byteArray = new Uint8Array(picture.data); // creates 8-bit array
                const blob = new Blob([byteArray], { type }); // creates new blob object from previous array and type of the file
                const albumArtUrl = URL.createObjectURL(blob); // finally creates an URL object -> src for img
                albumImageEl.src = albumArtUrl; // sets image src for current album
              } else {
                albumImageEl.classList.add("noAlbumCover"); // class for CSS rules (no border or shadow etc.)
                albumImageEl.src = UnknownImage; // sets default image as album cover for current album
              }

              albumContainerEl.setAttribute("data-album", songAlbum);
              albumContainerEl.setAttribute("data-artist", artist);

              bandNameEl.textContent = artist;
              titleDivEl.textContent = songAlbum;
              albumYearEl.textContent = albumYear;
              albumGenreEl.textContent = albumGenre;

              /* eventListener to hide OR show <ul> and <li> elements */
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

              /* add to the array of LiElements in songs[] */
              songs.push({ albumTitle: songAlbum, liElements: [liEl] });
            }
          } else {
            alert("Something went wrong");
            console.log("Error in addFiles()");
          }
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
    resetApp();

    let current = event.currentTarget as HTMLInputElement;
    let audioFiles = current.files as FileList;

    /* waits for addFiles() to be done */
    await addFiles(audioFiles)
      .then((isDone) => {
        if (isDone) {
          /* when Promise resolved and addFiles() is done
          removes class added in addFiles() that 
          prevents user to click any <li> before it's fully executed */
          let rightPaneContent = document.querySelector(".right-pane__content") as HTMLDivElement;
          rightPaneContent.classList.remove("noTouching");

          /* gets every <li> element from songs[] (and only <li>)
          and puts them in playlist[] in same order as in [Songs] */
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
    let current = event.currentTarget as HTMLInputElement;
    let audioFiles = current.files as FileList;

    /* if there's no songs in DOM - will execute as if user clicked on [Open files...]
       otherwise executes addFiles() and waits for it to be done */
    if (!songsDOM.length) {
      inputOpen(event);
    } else {
      await addFiles(audioFiles)
        .then((isDone) => {
          if (isDone) {
            playlist = []; // reset playlist because all elements from songs[] will be copied

            /* adds new <li> elements from songs[] 
            and puts them in playlist[] - simply copy */
            songs.forEach(function (song) {
              playlist = playlist.concat(...(song.liElements as Array<HTMLLIElement>));
            });

            /* re-shuffle playlist if isShuffled was enabled */
            if (isShuffledRef.current) {
              setIsShuffled(false);
              setIsShuffled(true);
            }
          }
        })
        .catch((error) => {
          alert("Something went wrong " + error);
          console.log(error);
        });
    }
  }

  /* ----------------------------------------------------- */
  /* --------| Play Previous audio from playlist |-------- */
  /* ----------------------------------------------------- */
  function previous() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // main <audio>

    /* if playlist contains audios and any song is already loaded */
    if (playlist.length > 1 && mainAudio.src) {
      let currentPlaying = document.querySelector(".nowPlaying") as HTMLLIElement; // current song that was/is selected
      let globalAlbumEL = document.getElementById("album") as HTMLDivElement;

      resetLyrics();

      /* when user chooses to enable the shuffle option
      shuffledPlaylist is selected instead of playlist */
      if (isShuffledRef.current) {
        let indexOfCurrent = shuffledPlaylist.indexOf(currentPlaying);

        /* if reaches beginning of the playlist plays the last audio
         otherwise plays previous audio from the playlist */
        if (indexOfCurrent === 0) {
          let previousIndex = shuffledPlaylist[shuffledPlaylist.length - 1];
          let previousAudio = previousIndex.getElementsByTagName("audio")[0];

          playNextOrPrevious(mainAudio, previousAudio, currentPlaying, previousIndex);

          let songName = previousIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = previousIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        } else {
          let previousIndex = shuffledPlaylist[indexOfCurrent - 1];
          let previousAUdio = previousIndex.getElementsByTagName("audio")[0];

          playNextOrPrevious(mainAudio, previousAUdio, currentPlaying, previousIndex);

          let songName = previousIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = previousIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        }
      } else {
        /* default playlist - no shuffle enabled */
        let indexOfCurrent = playlist.indexOf(currentPlaying); // get index of current audio in the playlist

        /* if reaches beginning of the playlist plays the last audio
         otherwise plays previous audio from the playlist */
        if (indexOfCurrent === 0) {
          let previousIndex = playlist[playlist.length - 1];
          let previousAudio = previousIndex.getElementsByTagName("audio")[0];

          playNextOrPrevious(mainAudio, previousAudio, currentPlaying, previousIndex);

          let songName = previousIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = previousIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        } else {
          let previousIndex = playlist[indexOfCurrent - 1]; // gets previous index (current - 1) element
          let previousAudio = previousIndex.getElementsByTagName("audio")[0]; // retrieves previous audio from playlist

          playNextOrPrevious(mainAudio, previousAudio, currentPlaying, previousIndex);

          let songName = previousIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = previousIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        }
      }
    }
  }

  /* ------------------------------------------------- */
  /* --------| Play Next audio from playlist |-------- */
  /* ------------------------------------------------- */
  function next() {
    let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // main <audio>

    /* if playlist contains audios and any song is already loaded */
    if (playlist.length > 1 && mainAudio.src) {
      let currentPlaying = document.querySelector(".nowPlaying") as HTMLLIElement; // current song that was/is selected
      let globalAlbumEL = document.getElementById("album") as HTMLDivElement;

      resetLyrics();

      /* when user chooses to enable the shuffle option
      shuffledPlaylist is selected instead of playlist */
      if (isShuffledRef.current) {
        let indexOfCurrent = shuffledPlaylist.indexOf(currentPlaying); // get index of current audio in the shuffledPlaylist

        /* if reaches end of the shuffledPlaylist plays the first audio
         otherwise plays next audio from the shuffledPlaylist */
        if (indexOfCurrent === shuffledPlaylist.length - 1) {
          let nextIndex = shuffledPlaylist[0];
          let nextAudio = nextIndex.getElementsByTagName("audio")[0];

          playNextOrPrevious(mainAudio, nextAudio, currentPlaying, nextIndex);

          let songName = nextIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = nextIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        } else {
          let nextIndex = shuffledPlaylist[indexOfCurrent + 1]; // gets next index (current + 1) element
          let nextAudio = nextIndex.getElementsByTagName("audio")[0]; // retrieves next audio from shuffledPlaylist

          playNextOrPrevious(mainAudio, nextAudio, currentPlaying, nextIndex);

          let songName = nextIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = nextIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        }
      } else {
        /* default playlist - no shuffle enabled */
        let indexOfCurrent = playlist.indexOf(currentPlaying); // get index of current audio in the playlist

        /* if reaches end of the playlist plays the first audio
         otherwise plays next audio from the playlist */
        if (indexOfCurrent === playlist.length - 1) {
          let nextIndex = playlist[0];
          let nextAudio = nextIndex.getElementsByTagName("audio")[0];

          playNextOrPrevious(mainAudio, nextAudio, currentPlaying, nextIndex);

          let songName = nextIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = nextIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        } else {
          let nextIndex = playlist[indexOfCurrent + 1]; // gets next index (current + 1) element
          let nextAudio = nextIndex.getElementsByTagName("audio")[0]; // retrieves next audio from playlist

          playNextOrPrevious(mainAudio, nextAudio, currentPlaying, nextIndex);

          let songName = nextIndex.getElementsByClassName("song__title")[0]; // gets <div> with song name
          let albumTitle = nextIndex.getAttribute("data-album") as string; // gets albumTitle from data attribute
          let artist = songName.getAttribute("data-artist") as string; // gets artist name from data attribute

          setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

          document.title = artist + " - " + songName.textContent;
        }
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

  /* --------------------------------------------------------------------- */
  /* --------| changes the global artwork on Click | Prev | Next |-------- */
  /* --------------------------------------------------------------------- */
  function setGlobalAlbumArt(albumTitle: string, artistTitle: string, globalAlbum: HTMLDivElement) {
    if (albumTitle === "Unknown") {
      globalAlbum.style.backgroundImage = `url(${UnknownImage})`; // default image
      globalAlbum.setAttribute("data-cover", "false"); // data to tell if there is album art so the borders AND reflection should appear if is enabled
    } else {
      let albumEL = document.querySelector(
        `.album[data-album="${albumTitle.replace(/\\([\s\S])|(")/g, "\\$1$2")}"][data-artist="${artistTitle.replace(
          /\\([\s\S])|(")/g,
          "\\$1$2"
        )}"]`
      ) as HTMLDivElement; // gets album from rightPane with same AlbumTitle and AlbumArtist + escape double quotes
      let albumImg = albumEL.getElementsByTagName("img")[0] as HTMLImageElement; // gets the <img> inside ALBUM <div>

      let imgSrc = albumImg.src; // get the src from <img> inside ALBUM <div> element

      globalAlbum.style.backgroundImage = `url(${imgSrc})`; // replaces the global art work with current

      /* condition to tell if data attribute should be set to TRUE of FALSE
      if ALBUM <img> has no cover art doesn't set the borders otherwise
      if it has cover art sets data attribute to true and border is displayed */
      if (albumImg.classList.contains("noAlbumCover")) {
        globalAlbum.setAttribute("data-cover", "false");
      } else {
        globalAlbum.setAttribute("data-cover", "true");
      }
    }
  }

  /* ------------------------------------------------------ */
  /* --------| resets lyrics from previous search |-------- */
  /* ------------------------------------------------------ */
  function resetLyrics() {
    let lyricsText = document.getElementsByClassName("lyrics__text")[0]; // lyrics text for specific song
    let lyricsAttr = lyricsText.getAttribute("data-lyrics"); // gets data attribute to check if <div> has lyrics text

    /* if <div> text has already lyrics from previous search */
    if (lyricsAttr === "true") {
      let lyricsBtn = document.getElementsByClassName("lyrics__button")[0] as HTMLDivElement; // gets button

      lyricsBtn.classList.remove("hide"); // displays button again
      lyricsText.textContent = ""; // removes previous lyrics
      lyricsText.classList.remove("show"); // hides lyrics__text <div>
    }
  }

  /* ------------------------------------------------------------- */
  /* --------| Plays selected audio from <li> on dbClick |-------- */
  /* ------------------------------------------------------------- */
  async function handleLiClick(event: MouseEvent) {
    let currentTarget = event.currentTarget as HTMLLIElement; // currentTarget so only <li> no child elements

    resetLyrics();

    /* re-shuffle playlist if isShuffled was enabled */
    if (isShuffledRef.current) {
      setIsShuffled(false);
      setIsShuffled(true);
    }

    /* only fires when <li> is dbClicked */
    if (currentTarget && currentTarget.nodeName === "LI") {
      let mainAudio = document.getElementById("mainAudio") as HTMLAudioElement; // gets main <audio>
      let playbarDuration = document.getElementsByClassName("duration")[0]; // gets duration element
      let previousLi = document.querySelector(".nowPlaying"); // gets previous playing song if exists

      let currentAudio = currentTarget.getElementsByTagName("audio")[0]; // gets <audio> from selected <li> element
      let songNameEL = currentTarget.getElementsByClassName("song__title")[0]; // gets <div> with song name
      let artist = songNameEL.getAttribute("data-artist") as string; // gets artist name from data attribute

      let albumTitle = currentTarget.getAttribute("data-album") as string; // get album title from data attribute
      let globalAlbumEL = document.getElementById("album") as HTMLDivElement;

      mainAudio.src = currentAudio.src; // gets src from selected audio
      mainAudio.load(); // loads the audio

      let playPromise = mainAudio.play();

      /* checks if promise isn't undefined after new src load and then plays audio */
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            mainAudio.play();
            setIsPlaying(true);
          })
          .catch((error) => {
            alert("Can't play this song");
          });
      }

      /* removes indicator from previous <li> selection if there is any */
      if (previousLi) {
        previousLi.classList.remove("nowPlaying");
      }

      playbarDuration.textContent = convertSeconds(currentAudio.duration); // sets current duration in DOM
      currentTarget.classList.add("nowPlaying"); // adds indicator on current <li>

      setGlobalAlbumArt(albumTitle, artist, globalAlbumEL);

      document.title = artist + " - " + songNameEL.textContent; // sets the title of document to the current song
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

  /* ----------------------------------------- */
  /* --------| handles files on drop |-------- */
  /* ----------------------------------------- */
  async function handleDrop(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();

    let current = event.currentTarget as HTMLSpanElement;
    let DT = event.dataTransfer as DataTransfer;
    let files = DT.files as FileList;

    current.classList.remove("highlight");

    await addFiles(files).then((isDone) => {
      if (isDone) {
        playlist = []; // reset playlist because all <li> elements from songs[] will be copied

        /* adds new <li> elements from songs[] 
        and puts them in playlist[] - simply copy */
        songs.forEach(function (song) {
          playlist = playlist.concat(...(song.liElements as Array<HTMLLIElement>));
        });

        /* re-shuffle playlist if isShuffled was enabled */
        if (isShuffledRef.current) {
          setIsShuffled(false);
          setIsShuffled(true);
        }
      }
    });
  }

  /* ----------------------------------------------------------- */
  /* --------| handles visual on dragging over the box |-------- */
  /* ----------------------------------------------------------- */
  function handleDragOver(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();

    let DT = event.dataTransfer as DataTransfer;
    DT.dropEffect = "copy"; // Copy "icon" instead of Move

    let current = event.currentTarget as HTMLSpanElement;
    current.classList.add("highlight");
  }

  /* ---------------------------------------------------- */
  /* --------| handles visual on leaving the box|-------- */
  /* ---------------------------------------------------- */
  function handleDragLeave(event: DragEvent) {
    event.stopPropagation();
    event.preventDefault();

    let current = event.currentTarget as HTMLSpanElement;
    current.classList.remove("highlight");
  }

  /* Prevents all drag events on App */
  ["drop", "dragover", "dragenter", "dragleave"].forEach((eventName) => {
    document.addEventListener(eventName, preventsDefaults, false);

    function preventsDefaults(e: Event) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

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

      <LeftPane
        index={activeIndex}
        handleInputs={handleInputsClick}
        handleDrop={handleDrop}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
      />
      <RightPane hideUnknownUl={displayHideList} />

      <Playbar
        isPlaying={isPlaying}
        previous={previous}
        next={next}
        isLooped={isLooped}
        loopAudio={loopAudio}
        isShuffled={isShuffled}
        shuffle={shuffle}
        isMuted={isMuted}
        mute={muteAudio}
      />

      <audio id="mainAudio" className="mainAudio" onEnded={next} loop={isLooped} />
    </div>
  );
};

export default App;
