import React from "react";
import { useEffect } from "react";
// import * as THREE from "three";
// import vertexShader from './vertex_shader.glsl';
// import fragmentShader from './fragment_shader.glsl'
import drawArrayVS from './shaders/drawArray.vertexShader.glsl'
import drawArrayFS from './shaders/drawArray.fragmentShader.glsl'

const renderCanvasWithShaders = require('./renderCanvasWithShaders')


export interface ShaderProps {
  custom: {[key: string]: any}
}

export const Shader = ({custom}: ShaderProps) => {
  useEffect(() => {
    renderCanvasWithShaders.render(drawArrayVS, drawArrayFS, custom)
  }, [custom]);
 return <canvas id="c"></canvas>
};
