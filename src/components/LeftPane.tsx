import React, { MouseEvent, KeyboardEvent } from "react";

interface Content {
  id: string;
}

interface Props {
  index: number;
}

const LeftPane = (props: Props) => {
  /* on component mount */
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

  // or React.createRef<HTMLUListElement>();
  // const [playlistName, setPlaylistName] = React.useState("-");

  const playlist_btn = React.useRef<HTMLDivElement>(null); //

  const input_container = React.useRef<HTMLDivElement>(null); // div with input
  const playlist_input = React.useRef<HTMLInputElement>(null); // input [new playlist]

  const ulListRef = React.createRef<HTMLUListElement>(); // ul list element

  /* on click [Create New Playlist] */
  function new_playlist(e: MouseEvent) {
    playlist_btn.current!.classList.add("hide"); // hide btn
    input_container.current!.classList.remove("hide"); // show input

    playlist_input.current!.removeAttribute("disabled"); // make accessible
    playlist_input.current!.focus(); // auto focus after click
  }

  /* on key press and if key pressed === Enter */
  function addPlaylist(e: KeyboardEvent) {
    if (e.key === "Enter" && playlist_input.current!.value.length > 0 && playlist_input.current!.value.trim().length) {
      /* if correct value - accept the playlist and create new one */

      const newLi = document.createElement("li");
      newLi.textContent = playlist_input.current!.value.trim();

      ulListRef.current!.appendChild(newLi);

      playlist_btn.current!.classList.remove("hide");
      input_container.current!.classList.add("hide");

      playlist_input.current!.setAttribute("disabled", "");

      playlist_input.current!.value = "";
    } else if (e.key === "Enter") {
      /* otherwise reset entry */

      playlist_btn.current!.classList.remove("hide");
      input_container.current!.classList.add("hide");

      playlist_input.current!.value = "";
      playlist_input.current!.setAttribute("disabled", "");
    }
  }

  const index = props.index;

  return (
    <div className="left-pane">
      <div className="left-pane__item">
        {ContentCollection.map((content, i) => (
          <div key={i} id={content.id} className={i === index ? "show" : "hide"}>
            {content.id === "file" && (
              <div className="file__content">
                <span className="drag-files">
                  <i className="material-icons md-64">save_alt</i>
                  <span>Drag .mp3 files</span>
                </span>

                <div className="open-files">
                  <i className="material-icons md-48">file_copy</i>
                  <div>Open files...</div>
                </div>

                <div className="add-files">
                  <i className="material-icons md-48">add</i>
                  <div>Add files...</div>
                </div>
              </div>
            )}
            {content.id === "lyrics" && (
              <div className="lyrics__content">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem veritatis, delectus tempora iure
                aspernatur sit!
                <br />
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut eos reprehenderit iusto itaque cupiditate?
                Repellat quas dolorum ipsa at nobis.
                <br /> Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                <br /> Eligendi eos aliquam aspernatur sapiente molestiae, at laboriosam omnis ex totam provident fuga
                porro praesentium, laudantium possimus neque beatae laborum quia assumenda.
              </div>
            )}
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

                <ul className="playlist__ul" ref={ulListRef}></ul>
              </div>
            )}
            {content.id === "theme" && <div className="theme__content">Theme</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export let ContentCollection: Content[] = [
  { id: "file" },
  { id: "album" },
  { id: "lyrics" },
  { id: "playlists" },
  { id: "theme" }
];

export default LeftPane;
