import React from "react";
import { useEffect } from "react";

const renderCanvasWithShaders = require('./renderCanvasWithShaders')


export interface ShaderProps {
  custom: {[key: string]: any}
}

export const Shader = ({custom}: ShaderProps) => {
  useEffect(() => {
    renderCanvasWithShaders.render({
        //drawTextureToScreenVS: drawTextureVS,
        //drawTextureToScreenFS: drawTextureFS,
        //createTextureVS,
        //createTextureFS,
        custom,
    })
  }, [custom]);
 return <canvas id="c"></canvas>
};
