import React from "react";

const Playbar = () => {
  return (
    <div className="playbar">
      <div className="playbar__progress">
        <span className="current-time">1 ' 06</span>

        <span className="progress-bar">
          <span className="line"></span>
        </span>

        <span className="duration">4 ' 20</span>
      </div>

      {/* repeat, shuffle and volume controls */}
      <div className="playbar__controls">
        {/* repeat container */}
        <span className="playbar__repeat">
          <i className="material-icons md-28">repeat</i>
        </span>

        {/* shuffle container */}
        <span className="playbar__shuffle">
          <i className="material-icons md-28">shuffle</i>
        </span>

        {/* volume container */}
        <div className="playbar__volume">
          <i className="material-icons md-28 vol-icon">volume_down</i>

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