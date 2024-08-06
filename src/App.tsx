import React, {useMemo, useState, useRef, useEffect} from 'react';
import './App.css';
import { Shader, OutputSelector, InputSelector } from './shader';
import { Slider, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import { useStateRef } from './useStateRef';

function App() {
  const [diffusionRate, setDiffusionRate, diffusionRateRef] = useStateRef(0.1)
  const [viscosity, setViscosity, viscosityRef] = useStateRef(0.1)
  const [outputSelector, setOutputSelector, outputSelectorRef] = useStateRef(OutputSelector.DENSITY)
  const [inputSelector, setInputSelector, inputSelectorRef] = useStateRef(InputSelector.DENSITY_AND_VELOCITY)
  const [play, setPlay] = useState(false)
  const playRef = useRef(false)
  const [fps, setFps] = useState(0)

  const shader = useMemo(() => (
   <Shader
     setFps={setFps}
     diffusionRateRef={diffusionRateRef} 
     viscosityRef={viscosityRef}
     inputSelectorRef={inputSelectorRef}
     outputSelectorRef={outputSelectorRef}
     runRef={playRef}
     canvasStyle={{width:"512px", height:"512px", border: "1px solid orange"}}
     height={512}
     width={512}
   />
  ), [setFps, diffusionRateRef, viscosityRef, outputSelectorRef, inputSelectorRef])

  const diffusionRateSlider = (
    <>
      Diffusion
      <Slider 
        size="small"
        valueLabelFormat={(value) => `Diffusion ${value.toFixed(2)}`}
        valueLabelDisplay="auto"
        scale={(value) => Math.pow(10000, value) / 100}
        min={0}
        step={0.001}
        max={1}
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
        valueLabelFormat={(value) => `Viscosity ${value.toFixed(2)}`}
        valueLabelDisplay="auto"
        scale={(value) => Math.pow(10000, value) / 100}
        min={0}
        step={0.001}
        max={1}
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

  const playButton = (
    <Button variant='outlined' onClick={(e) => {
      setPlay((p) => !p)
    }}>
      {play ? "Stop" : "Play"}
    </Button>
  )
  useEffect(() => {playRef.current = play}, [play])

  return (
    <div style={{marginLeft: "3em", marginTop: "3em"}}>
      <div style={{display: "flex", flexDirection: "row"}}>
        <div>
          {shader}
        </div>
        <div style={{display: "flex", flexDirection: "column", marginLeft: "1em"}}>
          <div>{inputSelectorButtons}</div>
          <div>{outputSelectorButtons}</div>
          <div>{diffusionRateSlider}</div>
          <div>{viscositySlider}</div>
          <div>{playButton}</div>
        </div>
      </div>
      <div>{Math.round(fps)} fps</div>
    </div>
  );
}

export default App;
