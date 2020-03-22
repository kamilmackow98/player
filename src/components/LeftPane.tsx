import React from "react";

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
            {content.id === "playlists" && <div>Playlists</div>}
            {content.id === "theme" && <div>Theme</div>}
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
