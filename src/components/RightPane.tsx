import React from "react";

const RightPane = () => {
  return (
    <div className="right-pane">
      <div className="right-pane__content">
        <ul className="audioFilesList"></ul>
        <audio controls id="myAudio"></audio>
      </div>
    </div>
  );
};

export default RightPane;
