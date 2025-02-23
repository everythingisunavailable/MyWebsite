import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.146/examples/jsm/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -10 * aspect, // Left
    10 * aspect, // Right
    10, // Top
    -10, // Bottom
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light);



class Drone {
    drone; // The 3D model of the drone
    x;
    y;
    z;

    direction = {
        a: false, // Left
        d: false, // Right
        w: false, // Forward
        s: false  // Backward
    };

    constructor(scene) {
        this.x = 0;
        this.y = 0;
        this.z = 0;

        const loader = new GLTFLoader();
        this.drone = null;

        loader.load('public/drone.glb', (gltf) => {
            this.drone = gltf.scene; 
            this.drone.position.set(this.x, this.y, this.z); 
            scene.add(this.drone); 
        }, undefined, (error) => {
            console.error('Error loading drone model:', error);
        });
    }

    // Example method to move the drone
    move() {
        if (this.direction.a) this.x -= 0.1; // Move left
        if (this.direction.d) this.x += 0.1; // Move right
        if (this.direction.w) this.y += 0.1; // Move up
        if (this.direction.s) this.y -= 0.1; // Move down

        // Update the drone's position
        if (this.drone) {
            this.drone.position.set(this.x, this.y, this.z);
        }
    }
}


let drone = new Drone(scene);
window.addEventListener('keypress', (event)=>{
    if (event.key === 'w' || event.key === 'W') {
        drone.direction.w = true;
        drone.direction.s = false;
    }    
    if (event.key === 's' || event.key === 'S') {
        drone.direction.w = false;
        drone.direction.s = true;
    }
    if (event.key === 'a' || event.key === 'A') {
        drone.direction.a = true;
        drone.direction.d = false;
    }
    if (event.key === 'd' || event.key === 'D') {
        drone.direction.d = true;
        drone.direction.a = false;
    }
});
window.addEventListener('keyup', (event)=>{
    if (event.key === 'w' || event.key === 'W') {
        drone.direction.w = false;
    }
    if (event.key === 's' || event.key === 'S') {
        
        drone.direction.s = false;
    }
    if (event.key === 'a' || event.key === 'A') {
        drone.direction.a = false;
        
    }
    if (event.key === 'd' || event.key === 'D') {
        drone.direction.d = false;
    }
});



// Animation loop
function animate() {
    drone.move();

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();