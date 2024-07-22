#version 300 es

// ABSOLUTE coordinates mean the coordinates of texture size, starting at (0, 0)
// TEXTURE coordinates are coords from 0 to 1, starting at the center of the texel.

precision highp float;

// vertex positions are in range [-1, 1].
in vec4 v_position;
// texture coordinates are in range [0, 1]
in vec2 v_input_texture_coord;

out vec4 out_density;

uniform sampler2D u_texture_source;
uniform sampler2D u_texture_v_hor;
uniform sampler2D u_texture_v_ver;
uniform sampler2D u_texture_density;

// u_dt is the interval in seconds
uniform float u_dt;

// Width and height of the texture.
uniform vec2 u_texture_size;

float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToAbsolute();
vec2 absoluteToTextureCoord(vec2 abs_coord);
//float getInputTextureValAbs(vec2 abs_coord);
//void setOutputDensity(float value);
//vec2 inputTextureCoordToAbsolute();


void main() {
    float density = getDataAtDXDY(u_texture_density, 0, 0);
    float source = getDataAtDXDY(u_texture_source, 0, 0);
    out_density = vec4(min(density + source * u_dt, 1.0), 0, 0, 1);
}


/*
N - width and height
b - boundary mode
diff - diffusion rate
dt - itnerval

*/
//void diffuse (sampler2D source, int N, int b, float *x, float *x0, float diff, float dt )
//{
//    int i, j, k;
//    float a = dt * diff * N * N;
//    for ( k=0 ; k<20 ; k++ ) {
//        output = (getDataAtDXDY(source, 0, 0) + a * (x[IX(i-1,j)]+x[IX(i+1,j)]+
//x[IX(i,j-1)]+x[IX(i,j+1)]))/(1+4*a);
//               
//        }
//    set_bnd ( N, b, x );
//    }
//}


float getDataAtDXDY(sampler2D source, int dx, int dy) {
    vec2 xy = fragCoordToAbsolute();
    xy = xy + vec2(float(dx), float(dy));
    vec2 coord = absoluteToTextureCoord(xy);
    return texture(source, coord)[0];
}

// fragCoordToAbsolute translates gl_FragCoord to absolute
// coordinates, directly corresponding to the texture pixels,
// starting at (0,0) (without 0.5 offset).
// gl_FragCoord returns center of the rendered pixel on the screen,
// which means that (0,0) pixel has coords of (0.5, 0.5).
vec2 fragCoordToAbsolute() {
    // TODO change to ivec2
    // TODO calculate it ONCE at the very beginning.
    vec2 xy = gl_FragCoord.xy - vec2(0.5, 0.5);
    return xy;
}

vec2 absoluteToTextureCoord(vec2 abs_coord) {
    return (abs_coord + vec2(0.5, 0.5)) / u_texture_size;
}


// 
// // Take absolute coordinates at input and return the texture value at output.
// float getInputTextureValAbs(vec2 abs_coord) {
//     vec2 p = absoluteToTextureCoord(abs_coord);
//     if (p.x < 0.0 || p.y < 0.0 || p.x >= u_texture_size.x || p.y >= u_texture_size.y) {
//         return 0.0;
//     }
//     vec4 t = texture(u_input_texture, p);
//     return t.r;
// }

//void setOutputDensity(float value) {
//    out_density = vec4(value, 0, 0, 1);
//}

// // v_textcoord is in texture coordinates, that is, from 0 to 1, and when rescaled, also the
// // center of the pixel is at (0.5, 0.5).
// vec2 inputTextureCoordToAbsolute() {
//     return (v_input_texture_coord * u_texture_size) - vec2(0.5, 0.5);
// }
