import React, {useMemo, useState} from 'react';
import './App.css';
import { Shader, OutputSelector } from './shader';
import { Slider, Select, MenuItem, SelectChangeEvent } from '@mui/material';


function App() {
  const [diffusionRate, setDiffusionRate] = useState(0.02)
  const [viscosity, setViscosity] = useState(0.01)
  const [fps, setFps] = useState(0)
  const [outputSelector, setOutputSelector] = useState(OutputSelector.DENSITY)

  const shader = useMemo(() => (
    <Shader
      setFps={setFps}
      diffusionRate={diffusionRate} 
      viscosity={viscosity}
      outputSelector={outputSelector}
    />
  ), [setFps, diffusionRate, viscosity, outputSelector])

  const diffusionRateSlider = (
    <>
      Diffusion
      <Slider 
        size="small"
        valueLabelDisplay="auto"
        min={0}
        step={0.001}
        max={0.5}
        value={diffusionRate}
        onChange={(e) => {
          const t = e.target as HTMLInputElement;
          setDiffusionRate(parseFloat(t.value))
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
    <div>
      <Select value={outputSelector} onChange={
        (e: SelectChangeEvent<OutputSelector>) => setOutputSelector(e.target.value as OutputSelector)
        }>
        <MenuItem value={OutputSelector.DENSITY}>Density</MenuItem>
        <MenuItem value={OutputSelector.DENSITY_SOURCE}>Density source</MenuItem>
        <MenuItem value={OutputSelector.HORIZONTAL_VELOCITY}>Horizontal vel.</MenuItem>
        <MenuItem value={OutputSelector.VERTICAL_VELOCITY}>Vertical vel.</MenuItem>
      </Select>
    </div>
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
