import React, { MouseEvent, KeyboardEvent } from "react";

interface Content {
  id: string;
}

interface Props {
  index: number;
}

const LeftPane = (props: Props) => {
  const playlist_btn = React.useRef<HTMLDivElement>(null); // or React.createRef<HTMLUListElement>();

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

  function reset_input() {
    playlist_btn.current!.classList.remove("hide"); // show btn
    input_container.current!.classList.add("hide"); // hide input

    playlist_input.current!.setAttribute("disabled", ""); // disable input
    playlist_input.current!.value = ""; // reset value in input
  }

  /* on key press and if key pressed === Enter */
  function addPlaylist(e: KeyboardEvent) {
    if (e.key === "Enter" && playlist_input.current!.value.length > 0 && playlist_input.current!.value.trim().length) {
      /* if correct value - accept the playlist and create new one */

      const newLi = document.createElement("li"); // create new <li> element
      newLi.textContent = playlist_input.current!.value.trim(); // <li> content = value from input

      ulListRef.current!.appendChild(newLi); // add created <li> to the <ul>

      if (ulListRef.current!.classList.contains("hide")) {
        ulListRef.current!.classList.remove("hide"); // shows <ul> element if contains .hide class
      }

      reset_input();
    } else if (e.key === "Enter") {
      /* otherwise reset entry */
      reset_input();
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
            {content.id === "album" && (
              <span className="reflection"></span>
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

                <ul className="playlist__ul hide" ref={ulListRef}></ul>
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
