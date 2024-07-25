import React, {useMemo, useState} from 'react';
import './App.css';
import { Shader } from './shader';
import { Slider } from '@mui/material';
//const foo = require("./foo")


function App() {
  const [diffusionRate, setDiffusionRate] = useState(0.1)
  const [fps, setFps] = useState(0)

  const shader = useMemo(() => (
    <Shader setFps={setFps} diffusionRate={diffusionRate}/>
  ), [setFps, diffusionRate])

  const diffusionRateSlider = (
    <>
      Diffusion
      <Slider 
        size="small"
        valueLabelDisplay="auto"
        min={0}
        step={0.01}
        max={1}
        value={diffusionRate}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          setDiffusionRate(parseFloat(t.value))
        }}
      />
    </>
  )

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer" hidden={false}>
        {diffusionRateSlider}
      </div>
      {shader}
      <div>{Math.round(fps)} fps</div>
    </div>
  );
}

export default App;
