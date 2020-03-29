import React from "react";

/* types for array collection */
export interface Links {
  name: string;
}

interface Props {
  handleClick: any;
  activeIndex: number;
}

const Navbar = (props: Props) => {
  const { handleClick, activeIndex } = props;

  return (
    <div className="navbar">
      <div className="navbar__container">
        {LinksCollection.map((link, i) => (
          /* for each element in array returns a div item on navbar */
          <div
            className={activeIndex === i ? "navbar__item active" : "navbar__item" /* checks if (i === activeIndex) */}
            onClick={() => {
              handleClick(i);
            }}
            key={i}
          >
            {link.name}
          </div>
        ))}
      </div>
      <div className="navbar__container">Playlist</div>
    </div>
  );
};

/* array collection of navbar items */
export let LinksCollection: Links[] = [
  { name: "File" },
  { name: "Album" },
  { name: "Lyrics" },
  { name: "Playlists" },
  { name: "Theme" }
];

export default Navbar;
