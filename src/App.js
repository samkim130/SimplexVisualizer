import React from "react";
import "./App.css";
import EquationInput from "./InputInformation/EquationInput.jsx";
//import P5Component from './p5Components/P5Component.jsx';
//import BarChart from './d3Components/BarChart.jsx';


function App() {
  /*
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetch("/time")
      .then((res) => res.json())
      .then((data) => {
        setCurrentTime(data.time);
      });
  }, []);
*/
  return (
    <div className="App">
      <EquationInput></EquationInput>
    </div>
  );
}

export default App;
