varying vec2 vUv;
uniform sampler2D buffer;
uniform float width;
uniform float height;


void main() {
  float x = vUv.x * width;
  float y = vUv.y * height;
  vec4 color = texture2D(buffer, vec2(x / width, y / height));
  gl_FragColor = color;
}