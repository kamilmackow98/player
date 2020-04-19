import React from "react";

interface Props {
  isPlaying: boolean;
  isLooped: boolean;
  isShuffled: boolean;
  isMuted: boolean;

  loopAudio: Function;
  shuffle: Function;
  mute: Function;
  previous: Function;
  next: Function;
}

const Playbar = (props: Props) => {
  return (
    <div className="playbar">
      <span className="timestamp"></span>

      <div className="playbar__left-controls">
        <span
          className="previous"
          onClick={(e) => {
            props.previous(e);
          }}
        >
          <i className="material-icons md-20">fast_rewind</i>
        </span>
        <span className="play-pause">
          <i className="material-icons md-20">{props.isPlaying ? "pause" : "play_arrow"}</i>
        </span>
        <span
          className="next"
          onClick={(e) => {
            props.next(e);
          }}
        >
          <i className="material-icons md-20">fast_forward</i>
        </span>
      </div>
      <div className="playbar__progress">
        <span className="current-time">-- : --</span>

        <span className="progress-bar">
          <span className="line"></span>
        </span>

        <span className="duration">-- : --</span>
      </div>

      {/* repeat, shuffle and volume controls */}
      <div className="playbar__right-controls">
        {/* repeat container */}
        <span
          className={props.isLooped ? "playbar__repeat selected" : "playbar__repeat"}
          onClick={(e) => {
            props.loopAudio(e);
          }}
        >
          <i className="material-icons md-20">repeat</i>
        </span>

        {/* shuffle container */}
        <span
          className={props.isShuffled ? "playbar__shuffle selected" : "playbar__shuffle"}
          onClick={(e) => {
            props.shuffle(e);
          }}
        >
          <i className="material-icons md-20">shuffle</i>
        </span>

        {/* volume container */}
        <div
          className="playbar__volume"
          onClick={(e) => {
            props.mute(e);
          }}
        >
          <i className="material-icons md-20 vol-icon">{props.isMuted ? "volume_off" : "volume_up"}</i>

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
