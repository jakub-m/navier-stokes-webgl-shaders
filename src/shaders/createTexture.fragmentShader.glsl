#version 300 es

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_texcoord;
out vec4 outColor;

uniform sampler2D u_input_texture;

void main() {
    //texture2D(u_input_texture, vec2(1,1));
    vec2 p = (v_position.xy + 1.0) / 2.0;
    float c = sqrt((p.x * p.x) + (p.y * p.y));
    outColor = vec4(c, c, c, 1);
    //vec2 p = v_texcoord.xy;
    // cannot convert from 'const mediump float' to 'out highp 4-component vector of float'
    //outColor = vec4(f, f, f, 1);
}

