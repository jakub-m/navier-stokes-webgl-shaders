// A file appended to all the other shaders.

float getData(sampler2D source) {
    return texture(source, v_input_texture_coord)[0];
}

float getDataAtDXDY(sampler2D source, int dx, int dy) {
    vec2 xy = fragCoordToResolution();
    xy = xy + vec2(float(dx), float(dy));
    vec2 coord = resolutionToTextureCoord(xy);
    return texture(source, coord)[0];
}

float getDataAt(sampler2D source, int x, int y) {
    vec2 coord = resolutionToTextureCoord(vec2(float(x), float(y)));
    return texture(source, coord)[0];
}

vec2 fragCoordToResolution() {
    vec2 xy = gl_FragCoord.xy - vec2(0.5, 0.5);
    return xy;
}

vec2 resolutionToTextureCoord(vec2 abs_coord) {
    return (abs_coord + vec2(0.5, 0.5)) / u_texture_size;
}