import React, { useState, useEffect } from 'react';
import './App.css';
import P5Component from './p5Components/P5Component.jsx';
import BarChart from './d3Components/BarChart.jsx';

function App() {
  const [currentTime, setCurrentTime] = useState(0);
  const state = {
    data: [12, 5, 6, 6, 9, 10],
    width: 700,
    height: 500
  }

  useEffect(() => {
    fetch('/time').then(res => res.json()).then(data => {
      setCurrentTime(data.time);
    });
  }, []);

  return (
    <div className="App">
      <P5Component/>
      <BarChart data={state.data} width={state.width} height={state.height}/>
      <header className="App-header">
        <p>The current time is {currentTime}.</p>
      </header>
    </div>
  );
}

export default App;
