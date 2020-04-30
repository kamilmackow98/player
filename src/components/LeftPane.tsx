import React from "react";

interface Content {
  id: string;
}

interface Props {
  handleDrop: Function;
  handleDragOver: Function;
  handleDragLeave: Function;
  handleInputs: Function;
  index: number;
}

const API_SEARCH = "https://api.happi.dev/v1/music?q=";
const API_KEY = "a785bdcxq0qLhDRbaymzbBBm3qFQkQ0IZZJyrLCZ5ywg2ZyswhL0fYpp";
let API_LYRICS = "";

const LeftPane = (props: Props) => {
  const { index, handleInputs, handleDrop, handleDragOver, handleDragLeave } = props;
  const [isChecked, setIsChecked] = React.useState(false);

  /* --------------------------------------------------------- */
  /* --------| search lyrics with fetch on Happi API |-------- */
  /* --------------------------------------------------------- */
  async function searchLyrics() {
    let currentPlaying = document.querySelector(".nowPlaying") as HTMLLIElement; // selected / playing song

    if (!currentPlaying) {
      alert("No songs selected or loaded");
    } else {
      let songTitleEl = currentPlaying.getElementsByTagName("div")[0] as HTMLDivElement; // <div> element from selected / current <li>

      let artist = songTitleEl.getAttribute("data-artist") as string; // artist from data attribute
      let songTitle = songTitleEl.textContent as string; // song title from HTML

      /* URL encode and trim string (%20 = spaces etc.) */
      artist = encodeURIComponent(artist.trim());
      songTitle = encodeURIComponent(songTitle.trim());

      /* Happi API fetch - search query -> API query + artist + song title */
      await fetch(API_SEARCH + artist + "%20" + songTitle + "&apikey=" + API_KEY)
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.result.length > 0) {
            let firstResult = data.result[0]; // gets first song from Array with results

            /* lyrics might be not avaiable for some songs OR artists */
            if (!firstResult.haslyrics) {
              alert("No Lyrics available");
            } else {
              API_LYRICS = firstResult.api_lyrics; // gets lyrics API only if song has lyrics from result

              /* second fetch but with lyrics API received from previous fetch */
              fetch(API_LYRICS + "?apikey=" + API_KEY)
                .then((response) => response.json())
                .then((data) => {
                  if (data.success) {
                    let lyrics = data.result.lyrics; // finally gets the lyrics

                    let lyricsText = document.getElementsByClassName("lyrics__text")[0] as HTMLDivElement; // gets HTML element to display lyrics
                    let lyricsBtn = document.getElementsByClassName("lyrics__button")[0] as HTMLDivElement; // gets button

                    lyricsBtn.classList.add("hide"); // hides the button
                    lyricsText.classList.add("show"); // shows lyrics HTML element

                    lyricsText.setAttribute("data-lyrics", "true"); // sets data attribute to later check if can reset lyrics TAB
                    lyricsText.textContent = lyrics; // displays lyrics on page
                  }
                })
                .catch((error) => {
                  alert("Something went wrong " + error);
                });
            }
          } else {
            alert("No Lyrics available");
          }
        })
        .catch((error) => {
          alert("Something went wrong " + error);
        });
    }
  }

  return (
    <div className="left-pane">
      <div className="left-pane__item">
        {ContentCollection.map((content, i) => (
          <div
            key={i}
            id={content.id}
            className={i === index ? "show" : "hide"}
            data-reflection={content.id === "album" ? isChecked : undefined}
          >
            {content.id === "file" && (
              <div className="file__content">
                <span
                  className="drag-files"
                  onDrop={(e) => {
                    handleDrop(e);
                    e.preventDefault();
                  }}
                  onDragOver={(e) => {
                    handleDragOver(e);
                  }}
                  onDragLeave={(e) => {
                    handleDragLeave(e);
                  }}
                >
                  <i className="material-icons size">save_alt</i>
                  <span>Drop .mp3 files</span>
                </span>

                <div
                  className="open-files"
                  onClick={(e) => {
                    handleInputs(e);
                  }}
                >
                  <i className="material-icons size">file_copy</i>
                  <div>Open files...</div>
                </div>

                <div
                  className="add-files"
                  onClick={(e) => {
                    handleInputs(e);
                  }}
                >
                  <i className="material-icons size">add</i>
                  <div>Add files...</div>
                </div>

                <div className="toggle-relfection">
                  <input
                    className="reflection-checkbox"
                    type="checkbox"
                    id="relfection-checkbox"
                    checked={isChecked}
                    onChange={() => {
                      setIsChecked(!isChecked);
                    }}
                  ></input>
                  <label htmlFor="relfection-checkbox">
                    {isChecked ? "Disable album reflection" : "Enable album reflection"}
                  </label>
                </div>
              </div>
            )}

            {content.id === "album" && (
              <div className={isChecked ? "reflection show" : "reflection"}>
                <span className="reflection__img"></span>
                <span className="reflection__shadow"></span>
              </div>
            )}

            {content.id === "lyrics" && (
              <div className="lyrics__content" data-lyrics="false">
                <div className="lyrics__text"></div>
                <div className="lyrics__button" onClick={searchLyrics}>
                  Search lyrics
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export let ContentCollection: Content[] = [{ id: "file" }, { id: "album" }, { id: "lyrics" }];

export default LeftPane;

/*

{content.id === "theme" && <div className="theme__content">Theme</div>}

const playlist_btn = React.useRef<HTMLDivElement>(null); // or React.createRef<HTMLUListElement>();

  const input_container = React.useRef<HTMLDivElement>(null); // div with input
  const playlist_input = React.useRef<HTMLInputElement>(null); // input [new playlist]

  const ulListRef = React.createRef<HTMLUListElement>(); // ul list element

  // on click [Create New Playlist] 
  function new_playlist(e: MouseEvent) {
    playlist_btn.current!.classList.add("hide"); // hide btn
    input_container.current!.classList.remove("hide"); // show input

    playlist_input.current!.removeAttribute("disabled"); // make accessible
    playlist_input.current!.focus(); // auto focus after click
  }

  function reset_input() {
    playlist_btn.current!.classList.remove("hide"); // show btn
    input_container.current!.classList.add("hide"); // hide input

    playlist_input.current!.setAttribute("disabled", ""); // disable input
    playlist_input.current!.value = ""; // reset value in input
  }

  // on key press and if key pressed === Enter 
  function addPlaylist(e: KeyboardEvent) {
    if (e.key === "Enter" && playlist_input.current!.value.length > 0 && playlist_input.current!.value.trim().length) {
      // if correct value - accept the playlist and create new one 

      const newLi = document.createElement("li"); // create new <li> element
      newLi.textContent = playlist_input.current!.value.trim(); // <li> content = value from input

      ulListRef.current!.appendChild(newLi); // add created <li> to the <ul>

      if (ulListRef.current!.classList.contains("hide")) {
        ulListRef.current!.classList.remove("hide"); // shows <ul> element if contains .hide class
      }

      reset_input();
    } else if (e.key === "Enter") {
      // otherwise reset entry 
      reset_input();
    }
  }

{content.id === "playlists" && (
              <div className="playlists__content">
                <div
                  ref={playlist_btn}
                  className="playlist__btn"
                  onClick={e => {
                    new_playlist(e);
                  }}
                >
                  <i className="material-icons md-48">add</i>
                  <div>Create new playlist</div>
                </div>

                <div className="playlist__input-container hide" ref={input_container}>
                  <input
                    disabled
                    maxLength={40}
                    id="new-input"
                    ref={playlist_input}
                    onKeyPress={event => {
                      addPlaylist(event);
                    }}
                    type="text"
                    placeholder="Playlist name"
                  />
                </div>

                <ul className="playlist__ul hide" ref={ulListRef}></ul>
              </div>
            )}

*/
