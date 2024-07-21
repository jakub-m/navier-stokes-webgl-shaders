#version 300 es

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_texcoord;
out vec4 out_color;

// This is an input texture. The output is produced to in out_color.
uniform sampler2D u_input_texture;

vec2 fragCoordToAbsolute();
vec2 inputTextureCoordToAbsolute();

void main() {
    //vec2 xy = fragCoordToAbsolute();
    vec2 xy = inputTextureCoordToAbsolute();
    if (xy.x == 3.0 && xy.y == 3.0) {
        out_color = vec4(1, 0, 0, 1);
    } else {
        out_color = vec4(0.5, 0, 0, 1);
    }
    //vec4 t = texture(u_input_texture, v_texcoord);
    //out_color = t;
}

// fragCoordToAbsolute translates gl_FragCoord to absolute
// coordinates, directly corresponding to the texture pixels,
// starting at (0,0) (without 0.5 offset).
//
// gl_FragCoord returns center of the rendered pixel on the screen, which means that
// (0,0) pixel has coords of (0.5, 0.5).
vec2 fragCoordToAbsolute() {
    vec2 xy = gl_FragCoord.xy - vec2(0.5, 0.5);
    return xy;
}

// v_textcoord is in texture coordinates, that is, from 0 to 1, and when rescaled, also the
// center of the pixel is at (0.5, 0.5).
vec2 inputTextureCoordToAbsolute() {
    return (v_texcoord * vec2(4, 4)) - vec2(0.5, 0.5);
}