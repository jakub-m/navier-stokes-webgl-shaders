import React, {useMemo, useState} from 'react';
import './App.css';
import { Shader, OutputSelector, InputSelector } from './shader';
import { Slider, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { useStateRef } from './useStateRef';

function App() {
  const [diffusionRate, setDiffusionRate, diffusionRateRef] = useStateRef(0.002)
  const [viscosity, setViscosity, viscosityRef] = useStateRef(0.01)
  const [outputSelector, setOutputSelector, outputSelectorRef] = useStateRef(OutputSelector.DENSITY)
  const [inputSelector, setInputSelector, inputSelectorRef] = useStateRef(InputSelector.DENSITY_AND_VELOCITY)
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
          setViscosity(value)
        }}
      />
    </>
  )

  const outputSelectorButtons = (
    <ToggleButtonGroup color="primary" value={outputSelector} exclusive onChange={
      (e) => {
        const value = e.target.value as OutputSelector
        setOutputSelector(value)
      }
}>
         <ToggleButton value={OutputSelector.DENSITY}>Density</ToggleButton>
         <ToggleButton value={OutputSelector.DENSITY_SOURCE}>Density source</ToggleButton>
         <ToggleButton value={OutputSelector.HORIZONTAL_VELOCITY}>Horiz. vel.</ToggleButton>
         <ToggleButton value={OutputSelector.VERTICAL_VELOCITY}>Vert. vel.</ToggleButton>
    </ToggleButtonGroup>
  )

  const inputSelectorButtons = (
    <ToggleButtonGroup color="primary" value={inputSelector} exclusive onChange={
      (e) => {
        const value = e.target.value as InputSelector
        setInputSelector(value)
      }
}>
         <ToggleButton value={InputSelector.DENSITY_AND_VELOCITY}>Dens. and vel.</ToggleButton>
         <ToggleButton value={InputSelector.DENSITY}>Dens.</ToggleButton>
         <ToggleButton value={InputSelector.VELOCITY}>Vel.</ToggleButton>
    </ToggleButtonGroup>
  )

  return (
    <div style={{marginLeft: "3em"}}>
      <div style={{height: "3em"}}></div>
      <div className="sliderContainer" hidden={false}>
        <div>{inputSelectorButtons}</div>
        <div>{outputSelectorButtons}</div>
        {diffusionRateSlider}
        {viscositySlider}
      </div>
      {shader}
      <div>{Math.round(fps)} fps</div>
    </div>
  );
}

export default App;
