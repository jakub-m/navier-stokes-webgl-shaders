// Render texture A to texture B
// Render texture B to texture A
// display A
// display B

import drawTextureToScreenVS from './shaders/drawTexture.vertexShader.glsl'
import drawTextureToScreenFS from './shaders/drawTexture.fragmentShader.glsl'
import renderToTextureVS from './shaders/createTexture.vertexShader.glsl'
import renderToTextureFS from './shaders/createTexture.fragmentShader.glsl'

const canvasId = "#c"

const TEXTURE_ID_A = 0
const TEXTURE_ID_B = 1

function render(args) {
    const {
        custom,
    } = args
    validateDefined({
        custom,
    })
    const gl = getGlContext(canvasId)

    const textureA = new Texture({gl, texture_id: TEXTURE_ID_A, height: 2, width:2})
    textureA.setValues([
        0, 255,0,255,
        0, 255,0,255,
        0, 255,0,255,
        0, 255,0,255,
    ])

    const textureB = new Texture({gl, texture_id: TEXTURE_ID_B, height: 2, width: 2})
    textureB.setValues([
        255, 0,0,255,
        255, 0,0,255,
        255, 0,0,255,
        255, 0,0,255,
    ])

    var textureRenderer = new TextureRenderer({gl})
    textureRenderer.renderToTexture(textureA)

    var canvasRenderer = new CanvasRenderer({gl})
    canvasRenderer.render(textureA, textureB)
}

class CanvasRenderer {
    constructor({gl}) {
        validateDefined({gl})
        resizeCanvasToDisplaySize(gl.canvas);
        this.gl = gl
        this.program = createProgramFromSources(gl, drawTextureToScreenVS, drawTextureToScreenFS)
    }

    /**
     * 
     * @param {Texture} texture_a 
     * @param {Texture} texture_b 
     */
    render(texture_a, texture_b) {
        var gl = this.gl
        var program = this.program
        gl.useProgram(program);

        var a_position_loc = gl.getAttribLocation(program, "a_position");
        var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
        var u_texture_a_loc = gl.getUniformLocation(program, "u_texture_a");
        var u_texture_b_loc = gl.getUniformLocation(program, "u_texture_b");
        validateLocation({a_position_loc, a_texcoord_loc})

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // TODO Is this initialization needed each time or once?
        const vertexCount = initFullSquareVertexPos(gl, a_position_loc)
        initFullSquareTexturePos(gl, a_texcoord_loc)

        gl.uniform1i(u_texture_a_loc, texture_a.texture_id)
        gl.uniform1i(u_texture_b_loc, texture_b.texture_id) 
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);  // Render to the canvas.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // gl.NEAREST_MIPMAP_LINEAR is default
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        // Clear the canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
    }
}


function getGlContext(selector) {
    const canvas = document.querySelector(selector);
    if (canvas === null) {
        console.error("canvas is missing")
        return
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("no webgl2!")
        return
    }
    return gl
}

class Texture {
    constructor({gl, texture_id, width, height}) {
        this.gl = gl
        this.texture = gl.createTexture();
        this.texture_id = texture_id
        this.height = height
        this.width = width
        gl.activeTexture(gl.TEXTURE0 + texture_id);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        initializeTexture(gl, this.texture, this.width, this.height)
    }

    setValues(data) {
        initializeTexture(this.gl, this.texture, this.width, this.height, data)
    }
}

/**
 * Render program to texture.
 */
class TextureRenderer {
    constructor({gl}) {
        validateDefined({gl})
        this.gl = gl
        this.program = createProgramFromSources(gl, renderToTextureVS, renderToTextureFS)
    }

    /**
     * @param {Texture} target 
     */
    renderToTexture(target) {
        var gl = this.gl
        var program = this.program
        gl.useProgram(program);

        var a_position_loc = gl.getAttribLocation(program, "a_position");
        var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
        var u_input_texture = gl.getUniformLocation(program, "u_input_texture")
        validateLocation({a_position_loc, a_texcoord_loc})

        var vao = gl.createVertexArray();
        gl.bindVertexArray(vao);

        // TODO do it only once, if at all.
        initFullSquareTexturePos(gl, a_texcoord_loc)
        const vertexCount = initFullSquareVertexPos(gl, a_position_loc)
        // TODO do I need to create frame buffer each time, or only once?
        this._attachFramebuffer(gl, target.texture, target.width, target.height)

        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1i(u_input_texture, target.texture_id)
        gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
    }

     _attachFramebuffer(gl, texture, width, height) {
        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.viewport(0, 0, width, height);
        const attachmentPoint = gl.COLOR_ATTACHMENT0;
        const level = 0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texture, level);
    }
}


/**
 * Set 6 vertices so they form a rectangle covering whole viewport.
 */
function initFullSquareVertexPos(gl, a_position_loc) {
    validateDefined({gl, a_position_loc})
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(a_position_loc);
    gl_vertexAttribPointer({
        gl,
        index: a_position_loc,
        size: 2,
        type: gl.FLOAT,
        normalize: false,
        stride: 0,
        offset: 0,
    })

    const w = 1
    const h = 1
  
    // -w, h  | w, h
    // -w, -h | w, -h
    const vertices = [
      // ccw
      -w, -h,
       w,  h,
      -w,  h,
      //
      -w, -h,
       w, -h,
       w,  h,
    ]
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW,
    );
  
    return vertices.length / 2;
}

/**
 * data parameter is optional, if null then the data in the texture is undefined.
 */
function initializeTexture(gl, texture, width, height, data) {
    validateDefined({gl, texture, width, height})
    assertEquals({width, height}, {width: 2, height: 2})
     
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    if (data) {
        data = new Uint8Array(data)
    }
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  width, height, border,
                  format, type, data);
   
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

}



function initFullSquareTexturePos(gl, a_texcoord_loc) {
    validateDefined({gl, a_texcoord_loc})
    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    // The texture positions must correspond to the vertices positions.
    const texPositions = [
      0, 0,
      1, 1,
      0, 1,
      0, 0,
      1, 0,
      1, 1,
    ]
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(texPositions),
        gl.STATIC_DRAW)
    gl.enableVertexAttribArray(a_texcoord_loc);
    gl_vertexAttribPointer({
        gl,
        index: a_texcoord_loc,
        size: 2,// 2 components per iteration
        type: gl.FLOAT,
        normalize: true, // convert from 0-255 to 0.0-1.0
        stride: 0,
        offset: 0,
    });
}

function gl_vertexAttribPointer(args) {
    const {gl, index, size, type, normalize, stride, offset} = args
    validateDefined(
        {gl, index, size, type, normalize, stride, offset})
    gl.vertexAttribPointer(
        index, size, type, normalize, stride, offset)
}

/** Validate that all the keys have defined values. */
function validateDefined(args) {
    for (const key of Object.keys(args)) {
        const v = args[key]
        if (v === null || v === undefined) {
            console.error("Value not defined:", key, "=", args[key])
        }
    }
}

function validateLocation(args) {
    for (const key of Object.keys(args)) {
        const v = args[key]
        if (v === null || v < 0) {
            console.error("Bad location:", key, "=", args[key])
        }
    }
}

function assertEquals(values, expected) {
    for (const key of Object.keys(values)) {
        const valueInput = values[key]
        const valueExpected = expected[key]
        if (valueInput !== valueExpected) {
            console.error("For key " + key + " expected value " + valueExpected + " but got " + valueInput)
        }
    }
}

/**
 * Ensure that the canvas has the same number of pixels as displayed on the screen. This is no obvious
 * because you could have canvas that has logically 10x10 pixels displayed as 40x40 picture on screen.
 */
function resizeCanvasToDisplaySize(canvas) {
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    // width - number of logical pixels
    // clientWidth - number of pixels occupied on the screen

    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    return needResize;
  }

function createProgramFromSources(gl, vertexShaderSource, fragmentShaderSource) {
    validateDefined({gl, vertexShaderSource, fragmentShaderSource})
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, "vertex shader", vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, "fragment shader", fragmentShaderSource);
    return createProgram(gl, vertexShader, fragmentShader);
}

function createShader(gl, type, name, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
   
    console.error("createShader " + name, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
  
    console.error("createProgram", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}


export {render}
