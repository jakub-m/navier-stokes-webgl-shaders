#version 300 es

//Fragment shader to draw array of float values in range of 0,1
 
precision highp float;

in vec4 v_position;
in vec2 v_texcoord;

out vec4 outColor;

void main() {
    //outColor = vec4(0, 1, 1, 1);
    vec2 p = (v_position.xy + 1.0) / 2.0;
    float c = sqrt((p.x * p.x) + (p.y * p.y));
    outColor = vec4(c, c, c, 1);
}

//// The texture data, in practice the array of the data we want to visualize.
//uniform sampler2D srcTex;
//
//// dstDimensions are (x,y) dimensions of the output (in pixels). Effectively
//// this is the dimnsion of the matrix of the data we want to display pixel-by-pixel.
//uniform ivec2 dstDimensions;


// void main() {
//   // dstPixel is (x, y) of each output pixel.  The lower left of gl_FragCoord
//   // is (0.5, 0.5) and the upper right is (W-0.5, H-0.5), where W and H are
//   // the width and the height of the viewport. 
//   // https://stackoverflow.com/questions/55319953
//   ivec2 dstPixel = ivec2(gl_FragCoord.xy);
//   int dstIndex = dstPixel.y * dstDimensions.x + dstPixel.x;
// 
//   ivec2 srcDimensions = textureSize(srcTex, 0);  // size of mip 0
// 
//   vec4 v1 = getValueFrom2DTextureAs1DArray(srcTex, srcDimensions, dstIndex * 2);
//   outColor = v1;
// }
// 
// vec4 getValueFrom2DTextureAs1DArray(sampler2D tex, ivec2 dimensions, int index) {
//   int y = index / dimensions.x;
//   int x = index % dimensions.x;
//   return texelFetch(tex, ivec2(x, y), 0);
// }
