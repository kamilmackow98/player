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

  const ulListRef = React.createRef<HTMLUListElement>(); // useRef<HTMLUListElement>(null)
  const playlist_input = React.createRef<HTMLInputElement>();
  const [playlistName, setPlaylistName] = React.useState("New Playlist");

  let li = document.createElement("li");

  /* on click [Create New Playlist] */
  function new_playlist(e: MouseEvent) {
    e.preventDefault();
    let children = e.currentTarget.children as HTMLCollectionOf<HTMLElement>;
    children[0].style["display"] = "none";
    children[1].style["display"] = "none";
    children[2].style["display"] = "initial";

    ulListRef.current!.appendChild(li);
    li.textContent = playlistName;
  }

  console.log("first log" + ulListRef);

  /* fire on change */
  function setName(name: string) {
    // li.textContent = playlistName;
    // setPlaylistName(name);
    if(ulListRef.current && ulListRef.current.lastChild) {
      ulListRef.current.lastChild.textContent = "1";
    }
    console.log(ulListRef);
    
  }

  /* on key press and if key pressed === Enter */
  function addPlaylist(e: KeyboardEvent) {
    // console.log(playlistName);

    if (e.key === "Enter" && playlist_input.current!.value.length > 0) {
      li.textContent = playlistName.trim();
      // console.log(li.textContent);
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
                  className="new-playlist"
                  onClick={e => {
                    new_playlist(e);
                  }}
                >
                  <i className="material-icons md-48">add</i>
                  <div>Create new playlist</div>
                  <input
                    ref={playlist_input}
                    onKeyPress={event => {
                      addPlaylist(event);
                    }}
                    onChange={event => {
                      setName(event.target.value);
                    }}
                    type="text"
                    placeholder="Playlist name"
                  />
                </div>
                <ul className="playlist__list" ref={ulListRef}>
                  <li>Blind Guardian [412]</li>
                  <li>Audioslave [64]</li>
                  <li>TOOL [87]</li>
                </ul>
              </div>
            )}
            {content.id === "theme" && <div className="theme__content">Theme</div>}
          </div>
        ))}
      </div>

      <div className="left-pane__item">
        <div className="left-pane__controls">
          <span className="previous">
            <i className="material-icons md-36">skip_previous</i>
          </span>
          <span className="play-pause">
            <i className="material-icons md-36">play_arrow</i>
          </span>
          <span className="next">
            <i className="material-icons md-36">skip_next</i>
          </span>
        </div>
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
