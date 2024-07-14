const { color } = require("@mui/system");

// TODO Render a matrix of points
// TODO Render square with texture hardcoded, sampled from points.
// TODO Have a program that modifies the matrix of points-


function render(vertexShaderSource, fragmentShaderSource, args) {
    const gl = getGlContext("#c")
    resizeCanvasToDisplaySize(gl.canvas);

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);

    var a_position_loc = gl.getAttribLocation(program, "a_position");
    var a_texcoord_loc = gl.getAttribLocation(program, "a_texcoord");
    validateLocation({a_position_loc})

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexCount = initializeVertexPosition(gl, a_position_loc, gl.canvas.width, gl.canvas.height)
    initializeTexture(gl, a_texcoord_loc)

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
   
    console.error("createShader", gl.getShaderInfoLog(shader));
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




// // Returns a random integer from 0 to range - 1.
// function randomInt(range) {
//     return Math.floor(Math.random() * range);
// }
   
// // Fills the buffer with the values that define a rectangle.
// function setRectangle(gl, x, y, width, height) {
//   var x1 = x;
//   var x2 = x + width;
//   var y1 = y;
//   var y2 = y + height;
//  
//   // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
//   // whatever buffer is bound to the `ARRAY_BUFFER` bind point
//   // but so far we only have one buffer. If we had more than one
//   // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
//  
//   gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//      x1, y1,
//      x2, y1,
//      x1, y2,
//      x1, y2,
//      x2, y1,
//      x2, y2]), gl.STATIC_DRAW);
// }


//function setTexcoords(gl) {
//    gl.bufferData(
//        gl.ARRAY_BUFFER,
//        new Float32Array([
//            0, 0,
//            0, 1,
//            1, 1,
//            ]),
//        gl.STATIC_DRAW);
//}

/**
    {
        gl: null,
        positionAttrLoc: null,
        // components per iteration
        size: null,
        // the data is 32bit floats (or other)
        type: null,
        normalize: null,
        // 0 = move forward size * sizeof(type) each iteration to get the next position
        stride: null,
        // start at the beginning of the buffer
        offset: null,
    }
 */

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


function initializeVertexPosition(gl, a_position_loc, width, height) {
    validateDefined({gl, a_position_loc, width, height})
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
      gl.STATIC_DRAW);

  return vertices.length / 2;
}

function initializeTexture(gl, a_texcoord_loc) {
    initializeTexturePositions(gl, a_texcoord_loc)
    initializeTextureValues(gl)
}

function initializeTexturePositions(gl, a_texcoord_loc) {
    gl.activeTexture(gl.TEXTURE0);
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

function initializeTextureValues(gl) {
    validateDefined({gl})
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // TODO check larger texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(
        [
            0, 0, 255, 255, // bottom-left
            0, 0, 255, 255, // bottom-right
            255, 0, 255, 255, // top-left
            0, 0, 255, 255, // top-right
        ]
    ));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // gl.NEAREST_MIPMAP_LINEAR is default
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

module.exports.render = render
