import React from "react";
import { useEffect } from "react";
import drawTextureVS from './shaders/drawTexture.vertexShader.glsl'
import drawTextureFS from './shaders/drawTexture.fragmentShader.glsl'
import createTextureVS from './shaders/createTexture.vertexShader.glsl'
import createTextureFS from './shaders/createTexture.fragmentShader.glsl'

const renderCanvasWithShaders = require('./renderCanvasWithShaders')


export interface ShaderProps {
  custom: {[key: string]: any}
}

export const Shader = ({custom}: ShaderProps) => {
  useEffect(() => {
    renderCanvasWithShaders.render({
        drawTextureToScreenVS: drawTextureVS,
        drawTextureToScreenFS: drawTextureFS,
        createTextureVS,
        createTextureFS,
        custom,
    })
  }, [custom]);
 return <canvas id="c"></canvas>
};
