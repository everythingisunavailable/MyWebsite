import * as THREE from 'three';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.146/examples/jsm/loaders/GLTFLoader.js';
const scene = new THREE.Scene();
const aspect = window.innerWidth / document.body.clientHeight; 
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
renderer.setSize(window.innerWidth, document.body.clientHeight);
document.body.appendChild(renderer.domElement);

// Add lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

const ambient_light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambient_light);



class Drone{
    drone; // The 3D model of the drone
    flame;
    animation_frames;
    count;
    reverse;
    x;
    y;
    z;
    min_speed;
    max_speed;
    h_speed;
    v_speed;
    a;

    direction = {
        a: false, // Left
        d: false, // Right
        w: false, // Forward
        s: false  // Backward
    };

    constructor(scene) {
        this.x = 1.7;
        this.y = 6.9;
        this.z = 0.0;
        this.max_speed = 0.1;
        this.min_speed = -0.1;
        this.h_speed = 0.0;
        this.v_speed = 0.0;
        this.a = 0.005;
        this.animation_frames = 16;
        this.count = 0;
        this.reverse = false;
        this.last_direction = '';

        const loader = new GLTFLoader();
        this.drone = null;

        //flame
        const geometry = new THREE.ConeGeometry();
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x3399ff, // Middle color
            emissive: 0x0033ff, // Deep blue glow
            emissiveIntensity: 2,
            transparent: true, 
            opacity: 0.2 
        });
        this.flame = new THREE.Mesh(geometry, material);
        this.flame.rotation.x = Math.PI;
        this.flame.position.set(0, -0.7, 0); // Adjust to be below the jetpack

        loader.load('public/drone.glb', (gltf) => {
            this.drone = gltf.scene; 
            this.drone.scale.set(aspect, aspect, aspect);
            this.drone.position.set(this.x, this.y, this.z); 
            scene.add(this.drone); 
            this.drone.add(this.flame);
        }, undefined, (error) => {
            console.error('Error loading drone model:', error);
        });
    }

    move(){
        //change vertical and horizontal speed values
        if (this.direction.a && this.h_speed > this.min_speed) this.h_speed -= this.a;
        if (this.direction.d && this.h_speed < this.max_speed) this.h_speed += this.a;
        if (this.direction.w && this.v_speed < this.max_speed) this.v_speed += this.a;
        if (this.direction.s && this.v_speed > this.min_speed) this.v_speed -= this.a;
        //change vertical and horizontal speed values to 0
        if (!this.direction.a && !this.direction.d && !this.direction.w && !this.direction.s){
            const epsilon = 0.01;
            //horizontal
            if (Math.abs(this.h_speed) < epsilon) this.h_speed = 0;
            else if (this.h_speed < 0) this.h_speed += this.a;
            else if(this.h_speed > 0) this.h_speed -= this.a;
            //vertical
            if (Math.abs(this.v_speed) < epsilon) this.v_speed = 0;
            else if (this.v_speed < 0) this.v_speed += this.a;
            else if(this.v_speed > 0) this.v_speed -= this.a;

        }
        else{
            //if its moving, scroll, with it;
            window.scrollTo(0, (1-Math.abs(this.y + TOP )/(TOP * 2)) * document.body.clientHeight - window.innerHeight/2);
        }
        //change coordinates
        if (!this.collides()) this.x += this.h_speed; this.y += this.v_speed;
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
                    this.flame.material.opacity = 0.2 + Math.random() * 0.2;
                    this.count = 0;
                    this.reverse = true;
                }
            }
            if (this.count < this.animation_frames && this.reverse) {
                this.flame.position.y -= 0.01;
                this.count++;
                if (this.count >= this.animation_frames) {
                    this.flame.material.opacity = 0.2 + Math.random() * 0.2;
                    this.count = 0;
                    this.reverse = false;
                }
            }
        }
    }

    collides(){
        if(this.x < LEFT * aspect){ this.x = LEFT * aspect; return true;}
        if(this.x > RIGHT * aspect){ this.x = RIGHT * aspect; return true;}
        if(this.y > TOP){this.y = TOP; return true;}
        if(this.y < BOTTOM){ this.y = BOTTOM; return true;}
        return false;
    }
}

let drone = null;

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



function emit_light_particles(){
    let drone_light = document.querySelector('.drone_light');
    drone_light.style = 'top: '+ (1-Math.abs(drone.y + TOP )/(TOP * 2)) * document.body.clientHeight +'px; left: '+ (Math.abs(drone.x + RIGHT * aspect )/(RIGHT * aspect * 2)) * window.innerWidth +'px;';
}

//Animation loop
function animate() {
    if (drone) {
        drone.move();
        drone.idle();
        drone.animate_flame();
        
        emit_light_particles();    
    }
    
    
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

window.onload = ()=>{if(window.innerWidth > 1100) drone = new Drone(scene); animate();}

let prev_width = window.innerWidth;
window.onresize = ()=>{if(window.innerWidth != prev_width) location.reload();};

window.onbeforeunload = ()=>{window.scrollTo(0, 0);}//scrolles to top befre refreshing

//button styling
let buttons = document.querySelectorAll('.contact-button');
buttons.forEach(button => {
    button.onmouseleave = ()=>{
        button.style = 'background : none';
    }

    button.addEventListener('mousemove', (event)=>{
        let x = event.clientX - button.getBoundingClientRect().left;
        let y = event.clientY - button.getBoundingClientRect().top;

        button.style = 'background : radial-gradient(circle at '+x+'px '+y+'px,rgba(255, 255, 255, 0.2),rgba(255, 255, 255, 0.0));';
    })
});

//navbar link targets
const projects = document.getElementById('projects');
const about = document.getElementById('about');
const contact = document.getElementById('contact');

let projects_y = projects.getBoundingClientRect().top;
let about_y = about.getBoundingClientRect().top;
let contact_y = contact.getBoundingClientRect().top;

window.onscroll = ()=>{
    if (window.scrollY > projects_y-200) {
        document.getElementById('nav-project').style = 'color: #67b0fe;';
        document.getElementById('nav-about').style = 'color: #ffeaea;';
        document.getElementById('nav-contact').style = 'color: #ffeaea;';
    }
    if (window.scrollY > about_y-200) {
        document.getElementById('nav-about').style = 'color: #67b0fe;';
        document.getElementById('nav-project').style = 'color: #ffeaea;';
        document.getElementById('nav-contact').style = 'color: #ffeaea;';
    }
    if (window.scrollY > contact_y-500) {
        document.getElementById('nav-contact').style = 'color: #67b0fe;';
        document.getElementById('nav-project').style = 'color: #ffeaea;';
        document.getElementById('nav-about').style = 'color: #ffeaea;';
    }
    if (window.scrollY < projects_y-200) {
        document.getElementById('nav-contact').style = 'color: #ffeaea;';
        document.getElementById('nav-project').style = 'color: #ffeaea;';
        document.getElementById('nav-about').style = 'color: #ffeaea;';
    }
}