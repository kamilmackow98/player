import React, { useState } from "react";

const Navbar = () => {
  const [active, setActive] = useState(0);

  function handleIndex() {
    alert("es");
  }

  React.useEffect(() => {
    let navbar__items = document.getElementsByClassName("navbar__item");

    for (let i = 0; i < navbar__items.length; i++) {
      navbar__items[i].addEventListener("click", () => {
        setActive(i);
        console.log(i);
        
      });
    }
  });

  return (
    <div className="navbar">
      <div className="navbar__container">
        <div id="file" className="navbar__item" onClick={handleIndex}>
          File
        </div>
        <div id="artwork" className="navbar__item">
          Album
        </div>
        <div id="lyrics" className="navbar__item">
          Lyrics
        </div>
        <div id="playlists" className="navbar__item">
          Playlists
        </div>
        <div id="playlists" className="navbar__item">
          Theme
        </div>
      </div>
      <div className="navbar__container">
        <div className="playlist__name">Playlist name</div>
      </div>
    </div>
  );
};

export default Navbar;
