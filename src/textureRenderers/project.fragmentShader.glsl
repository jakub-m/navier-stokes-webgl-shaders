//#version 300 es
//
//precision highp float;
//
////// header
////vec2 resolutionToTextureCoord(vec2 abs_coord);
////float getDataAtDXDY(sampler2D source, int dx, int dy);
////vec2 fragCoordToResolution();
////// header end
//
//in vec4 v_position;
//in vec2 v_input_texture_coord;
//
//out vec4 output_color;
//
//uniform sampler2D u_input_density; // "d0" in the Paper
//uniform sampler2D u_horizontal_velocity; // "u" in the Paper
//uniform sampler2D u_vertical_velocity; // "v" in the Paper
//
//uniform vec2 u_texture_size;
//uniform float u_dt;

float getData(sampler2D source);
float getDataAt(sampler2D source, int x, int y);
float getDataAtDXDY(sampler2D source, int dx, int dy);
vec2 fragCoordToResolution();
vec2 resolutionToTextureCoord(vec2 abs_coord);

// Implement "project" from p.10 of the Paper.
// The "project" was split into the following parts:
// 1. Calculate "div"
// 2. Empty "p"
// 3. Calculate p based on div
// 4. Calculate horizontal velocity based on p
// 5. Calculate vertical velocity based on p
void main() {
//void project ( int N, float * u, float * v, float * p, float * div )
{
    float width = u_texture_size.x;
    float height = u_texture_size.y;
    float h = 1.0/(width * height);

    int i, j, k;

    for ( i=1 ; i<=N ; i++ ) {
        for ( j=1 ; j<=N ; j++ ) {
            div[IX(i,j)] = -0.5 * h * (u[IX(i+1,j)] - u[IX(i-1,j)]+ v[IX(i,j+1)]-v[IX(i,j-1)]);
            p[ IX(i,j) ] = 0;
        }
    }

    set_bnd ( N, 0, div ); set_bnd ( N, 0, p );

    //for ( k=0 ; k<20 ; k++ ) {
    //    for ( i=1 ; i<=N ; i++ ) {
    //        for ( j=1 ; j<=N ; j++ ) {
    //            p[IX(i,j)] = (div[IX(i,j)]+p[IX(i-1,j)]+p[IX(i+1,j)]+
    //            p[IX(i,j-1)]+p[IX(i,j+1)])/4;
    //        }
    //    }
    //    set_bnd ( N, 0, p );
    //}
    //for ( i=1 ; i<=N ; i++ ) {
    //    for ( j=1 ; j<=N ; j++ ) {
    //        u[IX(i,j)] -= 0.5*(p[IX(i+1,j)]-p[IX(i-1,j)])/h;
    //        v[IX(i,j)] -= 0.5*(p[IX(i,j+1)]-p[IX(i,j-1)])/h;
    //    }
    //}
    //set_bnd ( N, 1, u ); set_bnd ( N, 2, v );
// }

}

















//    float width = u_texture_size.x;
//    float height = u_texture_size.y;
//
//    float dt0 = u_dt * sqrt(width * height);
//
//    vec2 xy_res = fragCoordToResolution();
//    float i = xy_res.x;
//    float j = xy_res.y;
//
//    float x = i - dt0 * getData(u_horizontal_velocity);
//    float y = j - dt0 * getData(u_vertical_velocity);
//    if (x < 0.5) x = 0.5;
//    if (x > width + 0.5) x = width + 0.5;
//    int i0 = int(x);
//    int i1 = i0 + 1;
//    if (y < 0.5) y = 0.5;
//    if (y > height + 0.5) y = height + 0.5;
//    int j0 = int(y);
//    int j1 = j0 + 1;
//    float s1 = x - float(i0);
//    float s0 = 1.0 - s1;
//    float t1 = y - float(j0);
//    float t0 = 1.0 - t1;
//
//    float d = (
//        s0 * (
//            t0 * getDataAt(u_input_density, i0, j0) +
//            t1 * getDataAt(u_input_density, i0, j1)) +
//        s1 * (
//            t0 * getDataAt(u_input_density, i1, j0) +
//            t1 * getDataAt(u_input_density, i1, j1))
//        );
//
//    output_color = vec4(d, 1.0, 1.0, 1.0);
//
////    // set_bnd ( N, b, x ); // TODO implement set_bnd
//}
//
////////////////////////////////////////////////////////////////////////////////
////// TODO move this to a common .glsl library and "import" in other files (concatenate).
//
//float getData(sampler2D source) {
//    return texture(source, v_input_texture_coord)[0];
//}
//
//float getDataAtDXDY(sampler2D source, int dx, int dy) {
//    vec2 xy = fragCoordToResolution();
//    xy = xy + vec2(float(dx), float(dy));
//    vec2 coord = resolutionToTextureCoord(xy);
//    return texture(source, coord)[0];
//}
//
//float getDataAt(sampler2D source, int x, int y) {
//    vec2 coord = resolutionToTextureCoord(vec2(float(x), float(y)));
//    return texture(source, coord)[0];
//}
//
//vec2 fragCoordToResolution() {
//    vec2 xy = gl_FragCoord.xy - vec2(0.5, 0.5);
//    return xy;
//}
//
//vec2 resolutionToTextureCoord(vec2 abs_coord) {
//    return (abs_coord + vec2(0.5, 0.5)) / u_texture_size;
//}


