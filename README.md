## shader-fluid

# Naive understanding of GPGPU

1. There are two shaders: Vertex Shader and Fragment Shader.

1. Vertex shader is a tiny program run on a tiny simple GPU machine that takes vertices (e.g. a two points of a line or three edges of a triangle) and does something with that (e.g. rotates or applies perspective).
1. Fragment shader is a tiny program un on a tiny simple GPU machine that takes the output pixels and returns colors for the pixels. To figure the color of the pixels, at input it gets information from vertex shader. The information can be, for example, a place on a line or in a triangle that corresponds to the pixel that is being rendered.
   GPU _interpolates_ the values that enter the fragment shader. For example, when rendering a mid-point on a line between (0,0) and (1,1), the fragment shader will get (0.5,0.5) at input.

1. Vertex and Fragment shader compose a Program.

1. There are many GPU cores and each runs the Program on its part of data.
1. [Variables](http://www.lighthouse3d.com/tutorials/glsl-tutorial/data-types-and-variables/):

   1. **const** are constants at compile time.
   1. **uniforms** are global variables. Used in both shaders.
   1. **attributes** are per-vertex values, used in Vertex shader. It's a read-only variable.
   1. **varying** are per-pixel values, read in Fragment shader. Can be written in vertex shader. Varying values are **interpolated**.

1. There are different [**primitives**](https://www.khronos.org/opengl/wiki/Primitive) like triangles, lines and points.
1. For JS to set attributes or uniforms variables, JS must obtain a **location** of the variable (a pointer) and use that location
   to interact with the variable.
1. There are different [**targets**](https://gamedev.stackexchange.com/questions/93947/what-is-buffer-target-in-opengl)
   that are slots associated with "something", for example, a buffer. Targets are [predefined and well-known](https://registry.khronos.org/OpenGL-Refpages/gl4/html/glBindBuffer.xhtml), like ARRAY_BUFFER with vertex attributes.

   1. Such an ARRAY_BUFFER (say a list of floats) would be accessed by vertex shader element by element. An "element" can be a "primitive", like a triangle (e.g. 3x2 floats each).
   1. You can bind a buffer to a target, and then you can modify the content of the buffer via the target (via the buffer variable).
      Copying data to the buffers is done with `bufferData`.
   1. Arrays of attributes (passed to vertex shader) need to be created with `createVertexArray`, bound with `bindVertexArray` and enabled with `enableVertexAttribArray`. Then you need to instruct the vertex shaders how to access the array with `vertexAttribPointer` (e.g. how many values to read per a single run of a shader) .
   1. OpenGL interfaces are weird.

1. Uniforms are set with functions like [`uniform2f`](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/uniform)
1. A **clip space** is the virtual volume where the vertices are operated upon. All the dimensions of the clip space (including the "canvas" that represent the pixels on the screen) are in range of [-1, 1].

# Useful references

- [Webpack and typescript](https://webpack.js.org/guides/typescript/)
- [Building a TypeScript-React Project from Scratch with Webpack](https://medium.com/javascript-journal-unlocking-project-potential/building-a-typescript-react-project-from-scratch-with-webpack-b224a3f84e3b)
- [Book of shaders](https://thebookofshaders.com/)
- [SO: How to keep coordination between particles and which texture pixel contains each one’s information?](https://stackoverflow.com/questions/56780278/how-to-keep-coordination-between-particles-and-which-texture-pixel-contains-each/)
- [SO: Updating buffers from within shaders in webgl](https://stackoverflow.com/questions/62744516/updating-buffers-from-within-shaders-in-webgl)
- [WebGL2 Fundamentals: GPGPU](https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html)
