import React, {useState} from 'react';
import './App.css';
import { Shader } from './shader';
import { Slider } from '@mui/material';
//const foo = require("./foo")


function App() {
  //console.log(foo)
  //foo.foo()
  //return (<div>foo</div>)
  const [offset, setOffset] = useState({x: 0, y: 0})

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer">
        Offset X
        <Slider 
          size="small"
          valueLabelDisplay="auto"
          min={0}
          step={1}
          max={100}
          value={offset.x}
          onChange={(e) => {
            const t = e.target as HTMLInputElement;
            setOffset({...offset, x: parseInt(t.value)})
          }}
        />
        Offset Y
        <Slider 
          size="small"
          valueLabelDisplay="auto"
          min={0}
          step={1}
          max={100}
          value={offset.y}
          onChange={(e) => {
            const t = e.target as HTMLInputElement;
            setOffset({...offset, y: parseInt(t.value)})
          }}
        />
      </div>
      <Shader custom={{offset}}/>
    </div>
  );
}

export default App;
