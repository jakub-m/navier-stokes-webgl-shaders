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
    vec4 tval_a = texture(u_texture_a, v_texcoord);
    vec4 tval_b = texture(u_texture_b, v_texcoord);
    //vec4 color_b = texture(u_texture_b, v_texcoord);

    //if (v_position.x < 0.0) {
    //    //out_color = color_a / 2.0;
    //    out_color= vec4(0, 0 ,1 ,1);
    //} else {
    //    //out_color = color_b / 3.0;
    //    out_color = vec4(1,1,0,1);
    //}

    //if (tval_a.r > 0.0 || tval_a.g > 0.0 || tval_a.b > 0.0) {
    //    out_color = vec4(0,1,0,1); // g
    //} else {
    //    out_color = vec4(1,0,0,1); // r
    //}

    //out_color = min(tval_a, tval_b);
    out_color = vec4( tval_a.r, tval_b.r, 0.0, 1.0);
}
