#version 300 es

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_texcoord;
uniform sampler2D u_texture_a;
uniform sampler2D u_texture_b;
out vec4 out_color;

void main() {
    vec4 t = texture(u_texture_a, v_texcoord);
    out_color = vec4(abs(t.r), abs(t.r), abs(t.r), 1.0);
}
