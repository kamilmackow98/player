import React, { useState } from "react";

/* array collection of navbar items */
export let LinksCollection: Links[] = [
  { id: "file", name: "File" },
  { id: "artwork", name: "Album" },
  { id: "lyrics", name: "Lyrics" },
  { id: "playlists", name: "Playlists" },
  { id: "theme", name: "Theme" }
];

/* types for array collection */
export interface Links {
  id: string;
  name: string;
}

const Navbar = () => {
  const [activeIndex, setActive] = useState(0); /* initial index set to 0 - [File] */

  /* change current index on click */
  function handleIndex(index: number) {
    setActive(index);
  }

  return (
    <div className="navbar">
      <div className="navbar__container">
        {LinksCollection.map((link, i) => (
          /* for each element in array returns a div item on navbar */
          <div
            className={activeIndex === i ? "navbar__item active" : "navbar__item" /* checks if (i === activeIndex) */}
            onClick={() => {
              handleIndex(i);
            }}
            id={link.id}
            key={i}
          >
            {link.name}
          </div>
        ))}
      </div>
      <div className="navbar__container">Playlist Name</div>
    </div>
  );
};

export default Navbar;
