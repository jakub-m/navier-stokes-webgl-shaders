import React from "react";
import { useEffect } from "react";
// import * as THREE from "three";
// import vertexShader from './vertex_shader.glsl';
// import fragmentShader from './fragment_shader.glsl'
import drawTextureVS from './shaders/drawTexture.vertexShader.glsl'
import drawTextureFS from './shaders/drawTexture.fragmentShader.glsl'

const renderCanvasWithShaders = require('./renderCanvasWithShaders')


export interface ShaderProps {
  custom: {[key: string]: any}
}

export const Shader = ({custom}: ShaderProps) => {
  useEffect(() => {
    renderCanvasWithShaders.render({
        vertexShaderSource: drawTextureVS,
        fragmentShaderSource: drawTextureFS,
        custom,
    })
  }, [custom]);
 return <canvas id="c"></canvas>
};
