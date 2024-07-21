#version 300 es

// ABSOLUTE coordinates mean the coordinates of texture size, starting at (0, 0)
// TEXTURE coordinates are coords from 0 to 1, starting at the center of the texel.

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_input_texture_coord;
out vec4 out_color;

// This is an input texture. The output is produced to in out_color.
uniform sampler2D u_input_texture;

// Width and height of the texture.
uniform vec2 u_texture_size;

vec2 fragCoordToAbsolute();
vec2 inputTextureCoordToAbsolute();
vec2 absoluteToTextureCoord(vec2 abs_coord);
float getInputTextureValAbs(vec2 abs_coord);
void setOutput(float value);


void main() {
    //vec2 xy = fragCoordToAbsolute();
    vec2 xy = inputTextureCoordToAbsolute();
    //if (xy.x == 3.0 && xy.y == 3.0) {
    //    out_color = vec4(1, 0, 0, 1);
    //} else {
    //    out_color = vec4(0.5, 0, 0, 1);
    //}

    //vec4 t = texture(u_input_texture, absoluteToTextureCoord(inputTextureCoordToAbsolute()));
    //out_color = t;

    vec2 p = inputTextureCoordToAbsolute();

    float v0 = getInputTextureValAbs(p);
    float v1 = getInputTextureValAbs(p - vec2( 1,0));
    float v2 = getInputTextureValAbs(p - vec2(-1,0));
    float v3 = getInputTextureValAbs(p - vec2( 0, 1));
    float v4 = getInputTextureValAbs(p - vec2( 0,-1));
    float v = 0.0;
    //if (v0 + v1 + v2 + v3 + v4  == 5.0) {
    //    v = 0.0;
    //} else {
    //    v = max(max(max(v0 , v1),max(v2, v3)), v4);
    //}
    v = max(max(max(v0 , v1),max(v2, v3)), v4);
    setOutput(v);
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

// Take absolute coordinates at input and return the texture value at output.
float getInputTextureValAbs(vec2 abs_coord) {
    vec2 p = absoluteToTextureCoord(abs_coord);
    if (p.x < 0.0 || p.y < 0.0 || p.x >= u_texture_size.x || p.y >= u_texture_size.y) {
        return 0.0;
    }
    vec4 t = texture(u_input_texture, p);
    return t.r;
}

void setOutput(float value) {
    out_color = vec4(value, 0, 0, 1);
}

// v_textcoord is in texture coordinates, that is, from 0 to 1, and when rescaled, also the
// center of the pixel is at (0.5, 0.5).
vec2 inputTextureCoordToAbsolute() {
    return (v_input_texture_coord * u_texture_size) - vec2(0.5, 0.5);
}

vec2 absoluteToTextureCoord(vec2 abs_coord) {
    return (abs_coord + vec2(0.5, 0.5)) / u_texture_size;
}
