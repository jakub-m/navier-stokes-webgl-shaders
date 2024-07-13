import React from "react";
import { useEffect } from "react";
import * as THREE from "three";
import vertexShader from './vertex_shader.glsl';
import fragmentShader from './fragment_shader.glsl'
const renderCanvasWithShaders = require('./renderCanvasWithShaders')


export interface ShaderProps {
  custom: {[key: string]: string | number}
}

export const Shader = ({custom}: ShaderProps) => {
  useEffect(() => {
    renderCanvasWithShaders.render(vertexShader, fragmentShader, custom)
  }, []);
 return <canvas id="c"></canvas>
};
