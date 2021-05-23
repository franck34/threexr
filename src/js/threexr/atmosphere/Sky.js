import * as THREE from 'three';

function Sky(world) {
        
    let skybox;

    function init() {
        skybox = dark();
    }

    function dark() {
        const geometry = new THREE.BoxGeometry( 250, 250, 250 );
        const path = '/threexr/atmosphere/skybox';
        const files = [
            `${path}/nightsky_ft.png`, //front side
            `${path}/nightsky_bk.png`, //back side
            `${path}/nightsky_up.png`, //up side
            `${path}/nightsky_dn.png`, //down side
            `${path}/nightsky_rt.png`, //right side
            `${path}/nightsky_lf.png`, //left side
        ];
    
        const cubeMaterials = [];
        for (let i = 0;i<files.length;i++) {
            cubeMaterials.push(new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load( files[i] ), side: THREE.DoubleSide }));
        }
    
        const skybox = new THREE.Mesh( geometry, cubeMaterials );
        return skybox;
    }

    init();

    return skybox;
}

export { Sky }