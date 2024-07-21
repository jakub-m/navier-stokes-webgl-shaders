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
    //vec2 p = (v_position.xy + 1.0) / 2.0;
    //vec2 p = (v_texcoord.xy);
    //float c = sqrt((p.x * p.x) + (p.y * p.y));
    //vec4 tval_a = texture(u_texture_a, v_texcoord);
    //vec4 tval_b = texture(u_texture_b, v_texcoord);
    //out_color = vec4(tval_a.r, tval_b.r, 0.0, 1.0);
    //vec4 t = texture(u_texture_a, v_texcoord);
    vec4 t = texture(u_texture_b, v_texcoord);
    out_color = vec4(t.r, t.r, t.r, 1.0);
}
