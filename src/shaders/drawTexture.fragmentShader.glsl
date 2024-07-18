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
    vec2 p = (v_position.xy + 1.0) / 2.0;
    // vec2 p = (v_texcoord.xy);
    float c = sqrt((p.x * p.x) + (p.y * p.y));
    //outColor = vec4(c, c, c, 1);
    //float f = texture(u_texture, vec2(1,1));
    vec4 color_a = texture(u_texture_a, v_texcoord);
    vec4 color_b = texture(u_texture_b, v_texcoord);
    if (v_position.x < 0.0) {
        out_color = color_a;
    } else {
        out_color = color_b;
    }
    //out_color = texture(u_texture_b, v_texcoord);
}
