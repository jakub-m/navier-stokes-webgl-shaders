import { useEffect } from "react";
import * as THREE from "three";
import vertexShader from './vertex_shader.glsl';
import fragmentShader from './fragment_shader.glsl'

export const Shader = () => {
  useEffect(() => {
    // Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create a buffer of values (2D matrix)
    const width = 256;
    const height = 256;
    const size = width * height;
    const data = new Float32Array(size * 4); // RGBA

    for (let i = 0; i < size; i++) {
      data[i * 4] = Math.random(); // R
      data[i * 4 + 1] = Math.random(); // G
      data[i * 4 + 2] = Math.random(); // B
      data[i * 4 + 3] = 1.0; // A
    }

    // Create Data Texture
    const texture = new THREE.DataTexture(
      data,
      width,
      height,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    texture.needsUpdate = true;

    // Shader Material
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        buffer: { value: texture },
        width: { value: width },
        height: { value: height },
      },
    });

    // Create a Plane to Render the Shader
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Render Loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();
  }, []);
 return null
};
