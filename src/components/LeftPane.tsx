import React from "react";

const LeftPane = () => {
  /* on component did mount */
  React.useEffect(() => {
    /* play & pause control */
    let play_pause = document.getElementsByClassName("play-pause")[0]; 

    play_pause.addEventListener("click", function(this: any) {
      /* first child of control - material icons */
      if (this.firstElementChild.textContent === "play_arrow") {
        this.firstElementChild.textContent = "pause";
      } else {
        this.firstElementChild.textContent = "play_arrow";
      }
    });

    /* album cover aspect ratio */
    let pane_content = document.getElementsByClassName("left-pane__content")[0] as HTMLDivElement;
    let content_width_init = pane_content.offsetWidth;

    /* initialize height */
    pane_content.style.height = `${content_width_init}px`;

    /* on resize keep aspect ratio */
    window.addEventListener("resize", function() {
      let content_width = pane_content.offsetWidth;

      pane_content.style.height = `${content_width}px`;

    })

  });

  return (
    <div className="left-pane" data-simplebar>
      <div className="left-pane__item">
        <div className="left-pane__content"></div>
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

export default LeftPane;