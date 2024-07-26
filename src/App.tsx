import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import { Shader, OutputSelector } from './shader';
import { Slider, Select, MenuItem, SelectChangeEvent, ToggleButtonGroup, ToggleButton } from '@mui/material';


function App() {
  const diffusionRateRef = useRef(0.002)
  const [viscosity, setViscosity] = useState(0.01)
  const [fps, setFps] = useState(0)
  const outputSelectorRef = useRef(OutputSelector.DENSITY)

  const shader = useMemo(() => (
    <Shader
      setFps={setFps}
      diffusionRateRef={diffusionRateRef} 
      viscosity={viscosity}
      outputSelectorRef={outputSelectorRef}
    />
  ), [setFps, diffusionRateRef, viscosity, outputSelectorRef])

  const diffusionRateSlider = (
    <>
      Diffusion
      <Slider 
        size="small"
        valueLabelDisplay="auto"
        min={0}
        step={0.001}
        max={0.2}
        value={diffusionRateRef.current}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          diffusionRateRef.current  = parseFloat(t.value)
        }}
      />
    </>
  )
  const viscositySlider = (
    <>
      Viscosity
      <Slider 
        size="small"
        valueLabelDisplay="auto"
        min={0}
        step={0.001}
        max={0.1}
        value={viscosity}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          setViscosity(parseFloat(t.value))
        }}
      />
    </>
  )

  const outputSelect = (
    <ToggleButtonGroup color="primary" value={outputSelectorRef.current} exclusive onChange={
      (e) => outputSelectorRef.current = (e.target.value as OutputSelector)
}>
         <ToggleButton value={OutputSelector.DENSITY}>Density</ToggleButton>
         <ToggleButton value={OutputSelector.DENSITY_SOURCE}>Density source</ToggleButton>
         <ToggleButton value={OutputSelector.HORIZONTAL_VELOCITY}>Horiz. vel.</ToggleButton>
         <ToggleButton value={OutputSelector.VERTICAL_VELOCITY}>Vert. vel.</ToggleButton>
    </ToggleButtonGroup>
  )
  /*
  <ToggleButtonGroup
  color="primary"
  value={alignment}
  exclusive
  onChange={handleChange}
  aria-label="Platform"
>
  <ToggleButton value="web">Web</ToggleButton>
  <ToggleButton value="android">Android</ToggleButton>
  <ToggleButton value="ios">iOS</ToggleButton>
  </ToggleButtonGroup>

  */

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer" hidden={false}>
        {outputSelect}
        {diffusionRateSlider}
        {viscositySlider}
      </div>
      {shader}
      <div>{Math.round(fps)} fps</div>
    </div>
  );
}

export default App;
