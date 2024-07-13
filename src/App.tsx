import React, {useState} from 'react';
import './App.css';
import { Shader } from './shader';
import { Slider } from '@mui/material';
//const foo = require("./foo")


function App() {
  //console.log(foo)
  //foo.foo()
  //return (<div>foo</div>)
  const [offsetX, setOffsetX] = useState(0)

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer">
        Offset x
        <Slider 
          size="small"
          valueLabelDisplay="auto"
          min={0}
          step={1}
          max={100}
          value={offsetX}
          onChange={(e) => {
            const t = e.target as HTMLInputElement;
            setOffsetX(parseInt(t.value))
          }}
        />
      </div>
      <Shader custom={{offsetX}}/>
    </div>
  );
}

export default App;
