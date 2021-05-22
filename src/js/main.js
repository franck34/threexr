import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

/*
	A most basic three.js scene
*/

let scene, camera, renderer, cube, controls, stats;
let worldOctree, playerCollider, playerVelocity, playerDirection;
let playerOnFloor = false;
const clock = new THREE.Clock();

const GRAVITY = 40;

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );


function init() {
	console.log('THREE v', THREE.REVISION);
	stats = new Stats();
	document.body.appendChild(stats.dom);

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x88ccff );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 1000 );

	addLights();

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.VSMShadowMap;

	document.body.appendChild( renderer.domElement );
	document.body.appendChild( VRButton.createButton( renderer ) );

	worldOctree = new Octree();

	playerCollider = new Capsule( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 1.5, 0 ), 0.35 );

	playerVelocity = new THREE.Vector3();
	playerDirection = new THREE.Vector3();

	loadMesh();

	/*
	// controls
	controls = new ImmersiveControls( camera, renderer );
	
	controls.addEventListener( 'keydown', (e) => {
		console.log( 'event: ', e );
		if ( playerOnFloor ) playerVelocity.y = 18;
	});

	
	controls.addEventListener( 'clickstart', (e) => {
		console.log( 'event: ', e );
	});
	
	controls.addEventListener( 'clickend', (e) => {
		console.log( 'event: ', e );
	});

	controls.mouseMovePower = 0.42;
	controls.mouseClamp = 0.6;

	scene.add( controls.viewerSpace );
	*/
}

function addLights() {

	const amblight = new THREE.AmbientLight( 0xa3adff, 0.25 );

	const dirLight = new THREE.DirectionalLight( 0xfeffde, 0.8 );
	dirLight.position.set( - 5, 25, - 1 );
	dirLight.castShadow = true;
	dirLight.shadow.camera.near = 0.01;
	dirLight.shadow.camera.far = 500;
	dirLight.shadow.camera.right = 30;
	dirLight.shadow.camera.left = - 30;
	dirLight.shadow.camera.top	= 30;
	dirLight.shadow.camera.bottom = - 30;
	dirLight.shadow.mapSize.width = 1024;
	dirLight.shadow.mapSize.height = 1024;
	dirLight.shadow.radius = 4;
	dirLight.shadow.bias = - 0.00006;

	scene.add( amblight, dirLight );

}

function loadMesh() {

	const loader = new GLTFLoader().setPath( './terrain/' );
	loader.load( 'collision-world.glb', ( gltf ) => {

		// make this particular navigation mesh more human-scale
		gltf.scene.traverse( (child) => {
			if ( child.geometry ) child.geometry.scale( 1.2, 1.2, 1.2 );
			if ( child.isMesh ) {
				child.castShadow = true;
				child.receiveShadow = true;
				if ( child.material.map ) {
					child.material.map.anisotropy = 8;
				}
			}

		});

		scene.add( gltf.scene );
		worldOctree.fromGraphNode( gltf.scene );
		//controls.navigationObject = gltf.scene;
		animate();
	} );
}

function playerCollisions() {
	const result = worldOctree.capsuleIntersect( playerCollider );
	playerOnFloor = false;
	if ( result ) {
		playerOnFloor = result.normal.y > 0;
		if ( ! playerOnFloor ) {
			playerVelocity.addScaledVector( result.normal, - result.normal.dot( playerVelocity ) );
		}
		playerCollider.translate( result.normal.multiplyScalar( result.depth ) );
	}
}

// add gravity and input to player velocity,
// then add their velocity to their position.

const crossVector = new THREE.Vector3();

function updatePlayer( deltaTime ) {

	// camera target * input's "forward" power
	playerVelocity.x = controls.viewDirection.x * controls.axes.y * 5;
	playerVelocity.z = controls.viewDirection.z * controls.axes.y * 5;

	// add camera target * input's "side" power
	crossVector.copy( controls.viewDirection );
	crossVector.cross( camera.up );
	playerVelocity.x += crossVector.x * controls.axes.x * 5;
	playerVelocity.z += crossVector.z * controls.axes.x * 5;

	if ( playerOnFloor ) {
		const damping = Math.exp( - 3 * deltaTime ) - 1;
		playerVelocity.addScaledVector( playerVelocity, damping );
	} else {
		playerVelocity.y -= GRAVITY * deltaTime;
	}

	const deltaPosition = playerVelocity.clone().multiplyScalar( deltaTime );
	playerCollider.translate( deltaPosition );

	playerCollisions();

	controls.viewerSpace.position.copy( playerCollider.start );

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	//controls.handleResize();
}

function animate() {
	renderer.setAnimationLoop( render );
}

function render() {
	const deltaTime = Math.min( 0.1, clock.getDelta() );
	//controls.update( deltaTime );
	//updatePlayer( deltaTime );
	renderer.render( scene, camera );
}
