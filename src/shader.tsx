import React from "react";
import { useEffect } from "react";
import * as THREE from "three";
import vertexShader from './vertex_shader.glsl';
import fragmentShader from './fragment_shader.glsl'
const renderCanvasWithShaders = require('./renderCanvasWithShaders')

export const Shader = () => {
  useEffect(() => {
    renderCanvasWithShaders.render(vertexShader, fragmentShader)
  }, []);
 return <canvas id="c"></canvas>
};
