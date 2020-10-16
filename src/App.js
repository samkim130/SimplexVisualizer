import React from "react";
import "./App.css";
import EquationInput from "./InputInformation/EquationInput.jsx";
import { EquationInputFunction } from "./InputInformation/InputHook.jsx";
import InputContextProvider from "./InputInformation/InputContextProvider.jsx";
import Navbar from "./Navbar.jsx";
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
    <InputContextProvider>
      <Navbar/>
      <div className="App">
        <EquationInputFunction></EquationInputFunction>
      </div>
    </InputContextProvider>
  );
}

export default App;
