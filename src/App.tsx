import React, {useState} from 'react';
import './App.css';
import { Shader } from './shader';
import { Slider } from '@mui/material';
//const foo = require("./foo")


function App() {
  //console.log(foo)
  //foo.foo()
  //return (<div>foo</div>)
  const [size, setSize] = useState(1.0)

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer">
        Size
        <Slider 
          size="small"
          valueLabelDisplay="auto"
          min={0.5}
          step={0.1}
          max={2}
          value={size}
          onChange={(e) => {
            const t = e.target as HTMLInputElement;
            setSize(parseFloat(t.value))
          }}
          
        />
      </div>
      <Shader custom={{size}}/>
    </div>
  );
}

export default App;
