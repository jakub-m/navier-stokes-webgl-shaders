shader-fluid
-----------------

# Naive understanding of GPGPU

1. There are two shaders: Vertex Shader and Fragment Shader.
1. Vertex and Frament shader compose a Program.
1. There are many GPU cores and each runs the Program on its part of data.
1. [Variables](http://www.lighthouse3d.com/tutorials/glsl-tutorial/data-types-and-variables/):
  1. **const** are constants at compile time.
  1. **uniforms** are global variables. Used in both shaders.
  1. **attributes** are per-vertex values, used in Vertex shader. It's a read-only variable.
  1. **varying** are per-pixel values, read in Fragment shader. Can be written in vertex shader. Varying values are **interpolated**.

# Useful references

- [Webpack and typescript](https://webpack.js.org/guides/typescript/)
- [Building a TypeScript-React Project from Scratch with Webpack](https://medium.com/javascript-journal-unlocking-project-potential/building-a-typescript-react-project-from-scratch-with-webpack-b224a3f84e3b)
- [Book of shaders](https://thebookofshaders.com/)
- [SO: How to keep coordination between particles and which texture pixel contains each one’s information?](https://stackoverflow.com/questions/56780278/how-to-keep-coordination-between-particles-and-which-texture-pixel-contains-each/)
- [SO: Updating buffers from within shaders in webgl](https://stackoverflow.com/questions/62744516/updating-buffers-from-within-shaders-in-webgl)
- [WebGL2 Fundamentals: GPGPU](https://webgl2fundamentals.org/webgl/lessons/webgl-gpgpu.html)
