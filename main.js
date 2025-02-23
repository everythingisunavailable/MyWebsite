import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.146/examples/jsm/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const LEFT = -10;
const RIGHT = 10;
const TOP = 10;
const BOTTOM = -10;
const camera = new THREE.OrthographicCamera(
    LEFT * aspect, // Left
    RIGHT * aspect, // Right
    TOP, // Top
    BOTTOM, // Bottom
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    flame;
    animation_frames;
    count;
    reverse;
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
        this.animation_frames = 16;
        this.count = 0;
        this.reverse = false;

        const loader = new GLTFLoader();
        this.drone = null;

        //flame
        const geometry = new THREE.ConeGeometry();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3399ff, // Middle color
            emissive: 0x0033ff, // Deep blue glow
            emissiveIntensity: 2,
            transparent: true, 
            opacity: 0.8 
        });
        this.flame = new THREE.Mesh(geometry, material);
        this.flame.rotation.x = Math.PI;
        this.flame.position.set(0, -0.7, 0); // Adjust to be below the jetpack

        loader.load('public/drone.glb', (gltf) => {
            this.drone = gltf.scene; 
            this.drone.position.set(this.x, this.y, this.z); 
            scene.add(this.drone); 
            this.drone.add(this.flame);
        }, undefined, (error) => {
            console.error('Error loading drone model:', error);
        });
    }

    // Example method to move the drone
    move() {

        if (this.direction.a && !this.collides()) this.x -= 0.1; // Move left
        if (this.direction.d && !this.collides()) this.x += 0.1; // Move right
        if (this.direction.w && !this.collides()) this.y += 0.1; // Move up
        if (this.direction.s && !this.collides()) this.y -= 0.1; // Move down
        
        // Update the drone's position
        if (this.drone) {
            this.drone.rotation.y += 0.1;
            this.drone.position.set(this.x, this.y, this.z);
        }
    }

    idle(){
        if (!this.direction.a && !this.direction.d && !this.direction.w && !this.direction.s && this.drone){
            //rotate
            this.drone.rotation.z = 0.1;
        }
    }

    animate_flame(){
        if (this.drone && this.flame) {
            this.flame.scale.x = 1 + Math.random() * 0.2; 
            
            if (this.count < this.animation_frames && !this.reverse) {
                this.flame.position.y += 0.01;
                this.count++;
                if (this.count >= this.animation_frames) {
                    this.flame.material.opacity = 0.5 + Math.random() * 0.3;
                    this.count = 0;
                    this.reverse = true;
                }
            }
            if (this.count < this.animation_frames && this.reverse) {
                this.flame.position.y -= 0.01;
                this.count++;
                if (this.count >= this.animation_frames) {
                    this.flame.material.opacity = 0.5 + Math.random() * 0.3;
                    this.count = 0;
                    this.reverse = false;
                }
            }
        }
    }

    collides(){
        if(this.x < LEFT * aspect){ this.x = LEFT * aspect; return true;}
        if(this.x > RIGHT * aspect){ this.x = RIGHT * aspect; return true;}
        if(this.y < BOTTOM){ this.y = BOTTOM; return true;}
        if(this.y > TOP){ this.y = TOP; return true;}
        return false;
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

//Animation loop
function animate() {
    drone.move();
    drone.idle();
    drone.animate_flame();
    
    //emitted light
    let drone_light = document.querySelector('.drone_light');
    drone_light.style = 'top: '+ (1-Math.abs(drone.y + TOP )/(TOP * 2)) * window.innerHeight +'px; left: '+ (Math.abs(drone.x + RIGHT * aspect )/(RIGHT * aspect * 2)) * window.innerWidth +'px;';
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

window.onload = ()=> {
    animate();
}