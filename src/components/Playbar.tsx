import React, { MouseEvent } from "react";

const Playbar = () => {
  /* toggle class on controls when clicked */
  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    e.currentTarget.classList.toggle("selected");
  }

  return (
    <div className="playbar">
      <div className="playbar__left-controls">
        <span className="previous">
          <i className="material-icons md-20">fast_rewind</i>
        </span>
        <span className="play-pause">
          <i className="material-icons md-20">play_arrow</i>
        </span>
        <span className="next">
          <i className="material-icons md-20">fast_forward</i>
        </span>
      </div>
      <div className="playbar__progress">
        <span className="current-time">1 : 06</span>

        <span className="progress-bar">
          <span className="line"></span>
        </span>

        <span className="duration">4 : 20</span>
      </div>

      {/* repeat, shuffle and volume controls */}
      <div className="playbar__right-controls">
        {/* repeat container */}
        <span
          className="playbar__repeat"
          onClick={e => {
            handleClick(e);
          }}
        >
          <i className="material-icons md-20">repeat</i>
        </span>

        {/* shuffle container */}
        <span
          className="playbar__shuffle"
          onClick={e => {
            handleClick(e);
          }}
        >
          <i className="material-icons md-20">shuffle</i>
        </span>

        {/* volume container */}
        <div className="playbar__volume">
          <i className="material-icons md-20 vol-icon">volume_down</i>

          <div className="volume__wrap">
            <span className="bar">
              <span className="line"></span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Playbar;
