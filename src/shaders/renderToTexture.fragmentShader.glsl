#version 300 es

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_texcoord;
out vec4 out_color;

// This is an input texture. The output is produced to in out_color.
uniform sampler2D u_input_texture;

void main() {
    vec4 t = texture(u_input_texture, v_texcoord);
    out_color = t;

}

