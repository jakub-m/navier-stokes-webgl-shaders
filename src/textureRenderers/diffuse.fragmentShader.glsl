#version 300 es

precision highp float;

// header
vec2 resolutionToTextureCoord(vec2 abs_coord);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
// header end

in vec4 v_position;
in vec2 v_input_texture_coord;

out vec4 output_color;

// Initial density, x0 in the paper
uniform sampler2D u_initial_density;

// The output density, x in the paper. The output of the shader is swapped with u_output_density in the next
// iteration, so in the share we can freely operate on the prevoius "snapshot" of the output and produce new
// output at the same time.
uniform sampler2D u_prev_density;

// Width and height of the texture.
uniform vec2 u_texture_size;

// diff is the diffusion rate.
uniform float u_diff;

// u_dt is the interval, a fraction of the second.
uniform float u_dt;

// Implement "diffuse" function from page 6 of the paper. This is a single diffuse step,
// the shader needs to be run k=20 times for a single full diffusion cycle.
void main() {
    float width = u_texture_size.x;
    float height = u_texture_size.y;

    float a = u_dt * u_diff * width * height;

    float surrounding = (
        getDataAtDXDY(u_prev_density, -1, 0) + 
        getDataAtDXDY(u_prev_density, +1, 0) + 
        getDataAtDXDY(u_prev_density, 0, -1) + 
        getDataAtDXDY(u_prev_density, 0, +1));
    
    float x0 = getDataAtDXDY(u_initial_density, 0, 0); // To optimize, no need to use getDataAtDXDY.
    float d = (x0 + a * surrounding) / (1.0 + 4.0 * a);
    //output_color = vec4(d, 1.0, 1.0, 1.0);
    output_color = vec4(d, 1.0, 1.0, 1.0);

    // TODO implement set_bnd
    // set_bnd ( N, b, x );
}



////////////////////////////////////////////////////////////////////////////
// TODO move this to a common .glsl library and "import" in other files (concatenate).

// "texture" coord means texture coordinates between 0 and 1.
// "resolution" coord are the actual pixel numbers, from 0 to width or height.

float getDataAtDXDY(sampler2D source, int dx, int dy) {
    vec2 xy = fragCoordToResolution();
    xy = xy + vec2(float(dx), float(dy));
    vec2 coord = resolutionToTextureCoord(xy);
    return texture(source, coord)[0];
}


// fragCoordToResolution translates gl_FragCoord to resolution
// coordinates, directly corresponding to the texture pixels,
// starting at (0,0) (without 0.5 offset).
// gl_FragCoord returns center of the rendered pixel on the screen,
// which means that (0,0) pixel has coords of (0.5, 0.5).
vec2 fragCoordToResolution() {
    // TODO change to ivec2
    // TODO calculate it ONCE at the very beginning.
    vec2 xy = gl_FragCoord.xy - vec2(0.5, 0.5);
    return xy;
}

vec2 resolutionToTextureCoord(vec2 abs_coord) {
    return (abs_coord + vec2(0.5, 0.5)) / u_texture_size;
}