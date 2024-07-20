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
    //vec4 t = texture(u_input_texture, v_texcoord);
    //vec2 p = (v_position.xy + 1.0) / 2.0;
    //float c = sqrt((p.x * p.x) + (p.y * p.y));
    //out_color = t - c;

    //out_color = vec4(1,0.5,0.5,0.5);
    out_color = vec4(0.5,0.0,0.0,0.0);

    //vec2 p = v_texcoord.xy;
    // cannot convert from 'const mediump float' to 'out highp 4-component vector of float'
    //out_color = vec4(f, f, f, 1);
}

