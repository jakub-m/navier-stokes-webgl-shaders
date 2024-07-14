#version 300 es
 
// fragment shaders don't have a default precision so we need
// to pick one. highp is a good default. It means "high precision"
precision highp float;
 
in vec2 v_texcoord;
// we need to declare an output for the fragment shader
out vec4 outColor;
uniform vec4 u_color;

uniform sampler2D u_texture;
 
void main() {
  // Just set the output to a constant reddish-purple
  //outColor = u_color;
  // outColor = v_color;
  outColor = texture(u_texture, v_texcoord);
}