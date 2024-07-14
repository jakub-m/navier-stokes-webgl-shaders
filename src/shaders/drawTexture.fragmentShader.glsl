#version 300 es

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_texcoord;
uniform sampler2D u_texture;
out vec4 outColor;

void main() {
    //vec2 p1 = (v_position.xy + 1.0) / 2.0;
    //vec2 p = (v_texcoord.xy);
    //float c = sqrt((p.x * p.x) + (p.y * p.y));
    //outColor = vec4(c, c, c, 1);
    outColor = texture(u_texture, v_texcoord);
}
