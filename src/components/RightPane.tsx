import React from "react";

const RightPane = () => {
  const [change, setChange] = React.useState("");

  return (
    <div className="right-pane">
      <div className="right-pane__content">
        <label htmlFor="test">Type something </label>
        <input type="text" id="test" onChange={event => setChange(event.target.value)} />
        <div>{change}</div>
      </div>
    </div>
  );
};

export default RightPane;
