import React from "react";
import ReactDOM from "react-dom";
import WheelOfPrizes from "../js/wheel";

function App() {
  return (
    <div className="App">
      <h1>Wheel of Prizes</h1>
      <WheelOfPrizes />
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById("wheel"));