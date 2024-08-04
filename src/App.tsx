import React, {useMemo, useRef, useState} from 'react';
import './App.css';
import { Shader, OutputSelector } from './shader';
import { Slider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { getParsedCommandLineOfConfigFile } from 'typescript';

function App() {
  const diffusionRateRef = useRef(0.002)
  const [diffusionRate, setDiffusionRate] = useState(0.002)
  const viscosityRef = useRef(0.01)
  const [viscosity, setViscosity] = useState(0.01)
  const outputSelectorRef = useRef(OutputSelector.DENSITY)
  const [outputSelector, setOutputSelector] = useState(OutputSelector.DENSITY)
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
        value={diffusionRate}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          const value = parseFloat(t.value)
          diffusionRateRef.current  = value
          setDiffusionRate(value)
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
          const value = parseFloat(t.value)
          viscosityRef.current = parseFloat(t.value)
          setViscosity(value)
        }}
      />
    </>
  )

  const outputSelect = (
    <ToggleButtonGroup color="primary" value={outputSelector} exclusive onChange={
      (e) => {
        const value = e.target.value as OutputSelector
        setOutputSelector(value)
        outputSelectorRef.current = value
      }
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
        <div>{outputSelect}</div>
        {diffusionRateSlider}
        {viscositySlider}
      </div>
      {shader}
      <div>{Math.round(fps)} fps</div>
    </div>
  );
}

export default App;
