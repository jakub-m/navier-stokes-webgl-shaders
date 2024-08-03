import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import { Shader, OutputSelector } from './shader';
import { Slider, ToggleButtonGroup, ToggleButton } from '@mui/material';

function App() {
  const diffusionRateRef = useRef(0.002)
  const viscosityRef = useRef(0.01)
  const outputSelectorRef = useRef(OutputSelector.DENSITY)
  const [fps, setFps] = useState(0)

  const shader = useMemo(() => (
    <Shader
      setFps={setFps}
      diffusionRateRef={diffusionRateRef} 
      viscosityRef={viscosityRef}
      outputSelectorRef={outputSelectorRef}
      canvasStyle={{width:"512px", height:"512px", border: "1px solid black"}}
      height={512}
      width={512}
    />
  ), [setFps, diffusionRateRef, viscosityRef, outputSelectorRef])

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
        value={viscosityRef.current}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          viscosityRef.current = parseFloat(t.value)
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
