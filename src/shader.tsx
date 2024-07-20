import React from "react";
import { useEffect, useState, useRef, useCallback } from "react";

//const renderCanvasWithShaders = require('./renderCanvasWithShaders')
import {render} from './renderCanvasWithShaders'
import { request } from "http";


export interface ShaderProps {
  run: boolean
  custom: {[key: string]: any}
}

export const Shader = ({custom}: ShaderProps) => {
  const [run, setRun] = useState(false);
  const requestRef = useRef<number>()
  const prevTimeRef = useRef(0)

  const animate = useCallback((time: number) => {
    // `time` is in ms
    var deltaMs = 0;
    if (prevTimeRef.current !== 0) {
      deltaMs = time - prevTimeRef.current
    }
    prevTimeRef.current = time
    console.log(1000/deltaMs + " fps");
    render({custom})
    requestRef.current = requestAnimationFrame(animate);
  }, [custom])

  useEffect(() => {
    if (run) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      render({custom})
    }
    return () => {
      if (requestRef.current === undefined) {
        return
      }
      cancelAnimationFrame(requestRef.current)
    };
  }, [animate, run, custom]);

  //useEffect(() => {
  //  render({
  //      custom,
  //  })
  //}, [custom]);
 const pausePlayButton = (run) ? "stop" : "play";
 const handleClickPlay = () => {
  setRun(r => !r)
 }
 return (
  <>
    <canvas id="c"></canvas>
    <div onClick={handleClickPlay}>{pausePlayButton}</div>
  </>)
};
