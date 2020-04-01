import React from "react";
import image from "../images/1.jpg";

const RightPane = () => {
  return (
    <div className="right-pane">
      <div className="right-pane__content">
        <div className="album">
          <div className="album__info">
            <img className="album__cover" src={image} alt="test" />
            <div className="band__name">TOOL</div>
            <div className="album__title">
              <div className="title">Fear Inoculum</div> <span className="line"></span>{" "}
              <span className="album__year">2009</span>
            </div>
            <span className="album__genre">Progressive Metal</span>
          </div>
          <ul className="audio__list">
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
            <li>
              <span className="track-nb">01.</span>
              <div className="song__title">Disco Biscuit</div>
              <span className="song__duration">03:19</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RightPane;
