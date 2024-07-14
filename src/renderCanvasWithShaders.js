const { color } = require("@mui/system");

function render(vertexShaderSource, fragmentShaderSource, args) {
    const canvas = document.querySelector("#c");
    if (canvas === null) {
        console.error("canvas is missing")
    }
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        console.error("no webgl2!")
        return
    }

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    var program = createProgram(gl, vertexShader, fragmentShader);
    var positionAttrLoc = gl.getAttribLocation(program, "a_position");
    validateLocation({positionAttrLoc})
    // var colorAttrLoc = gl.getAttribLocation(program, "a_color");
    // validateLocation({colorAttrLoc})
    var texcoordAttrLoc = gl.getAttribLocation(program, "a_texcoord")
    validateLocation({texcoordAttrLoc})
    var resolutionUniLoc = gl.getUniformLocation(program, "u_resolution");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var offsetUniLoc = gl.getUniformLocation(program, "u_offset")

    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    // Start position
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttrLoc);
    gl_vertexAttribPointer({gl, index: positionAttrLoc, size: 2, type: gl.FLOAT, normalize: false, stride: 0, offset: 0})
    setGeometry(gl)
    // End position

    // // Start color
    // var colorBuffer = gl.createBuffer()
    // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    // gl.enableVertexAttribArray(colorAttrLoc)
    // var colorData = [
    //     1, 0, 0, 1,
    //     0, 1, 0, 1,
    //     0, 0, 1, 1,
    // ]
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    // gl_vertexAttribPointer({gl, index: colorAttrLoc, size: 4, type: gl.FLOAT, normalize: false, stride: 0, offset: 0})
    // // End color
    // Start texture
    var texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer)
    setTexcoords(gl) // just the coordinates, not the texture itself.
    gl.enableVertexAttribArray(texcoordAttrLoc)
    gl_vertexAttribPointer( {gl, index: texcoordAttrLoc, size: 2, type: gl.FLOAT, normalize: false, stride: 0, offset: 0});

    var texture = gl.createTexture()
    //// now the texture image
    //var texture = gl.createTexture()
    //gl.activeTexture(gl.TEXTURE0 + 0);
    //gl.bindTexture(gl.TEXTURE_2D, texture);
    //// placeholder texture
    //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    //    new Uint8Array([
    //        255,   0, 255, 255,
    //          0, 255, 255, 255,
    //        255,   0,   0, 255,
    //          0, 255, 255, 255,
    //    ]))
    //gl.generateMipmap(gl.TEXTURE_2D);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    var image = new Image();
    image.src = "f-texture.png";
    // image.src = "logo192.png";
    image.addEventListener('load', function() {
      console.log("image loaded", image)
      //// Now that the image has loaded make copy it to the texture.
      createImageBitmap(image).then((bitmap) => {
        console.log("bitmap", bitmap)
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            bitmap);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      })
    });



    // End texture

    resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    gl.uniform2f(resolutionUniLoc, gl.canvas.width, gl.canvas.height);

    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);
    gl.uniform2f(offsetUniLoc, args.offset.x, args.offset.y)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
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


function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
   
    // Check if the canvas is not the same size.
    const needResize = canvas.width  !== displayWidth ||
                       canvas.height !== displayHeight;
   
    if (needResize) {
      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
   
    return needResize;
  }


// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
}
   
// Fills the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
 
  // NOTE: gl.bufferData(gl.ARRAY_BUFFER, ...) will affect
  // whatever buffer is bound to the `ARRAY_BUFFER` bind point
  // but so far we only have one buffer. If we had more than one
  // buffer we'd want to bind that buffer to `ARRAY_BUFFER` first.
 
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2]), gl.STATIC_DRAW);
}


function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
             0, 0,
           100,  100,
           100,  0]),
      gl.STATIC_DRAW);
}

function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0, 0,
            0, 1,
            1, 1,
            ]),
        gl.STATIC_DRAW);
}

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

function gl_vertexAttribPointer(args) {
    const {gl, index, size, type, normalize, stride, offset} = args
    validateDefined(
        {gl, index, size, type, normalize, stride, offset})
    gl.vertexAttribPointer(
        index, size, type, normalize, stride, offset)
}

function validateLocation(args) {
    for (const key of Object.keys(args)) {
        const v = args[key]
        if (v === null || v < 0) {
            console.error("Bad location:", key, "=", args[key])
        }
    }
}

function validateDefined(args) {
    for (const key of Object.keys(args)) {
        const v = args[key]
        if (v === null || v === undefined) {
            console.error("Value not defined:", key, "=", args[key])
        }
    }
}

module.exports.render = render
