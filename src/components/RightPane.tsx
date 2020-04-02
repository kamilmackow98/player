import React from "react";
import image from "../images/unk.png";

const RightPane = () => {
  return (
    <div className="right-pane">
      <div className="right-pane__content">
        <div className="album unknown hidden" data-album="unknown">
          <div className="album__info">
            <img className="album__cover" src={image} alt="unknown" />

            <div className="band__name">Unknown albums</div>

            <div className="album__title">
              <div className="title">Unknown</div> <span className="line"></span>{" "}
              <span className="album__year">Unknown</span>
            </div>

            <span className="album__genre">Unknown</span>
          </div>

          <ul className="audio__list"></ul>
        </div>
      </div>
    </div>
  );
};

export default RightPane;
