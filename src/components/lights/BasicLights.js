import { Group, SpotLight, AmbientLight, HemisphereLight } from 'three';

class BasicLights extends Group {
    constructor(...args) {
        // Invoke parent Group() constructor with our args
        super(...args);

        // gold
        const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        const ambi = new AmbientLight(0x004d0d, 1.32);
        const hemi = new HemisphereLight(0x064f13, 0x064f13, 1.3);

        // lava
        // const dir = new SpotLight(0xffffff, 1.6, 7, 0.8, 1, 1);
        // const ambi = new AmbientLight(0x00ffff, 1.32);
        // const hemi = new HemisphereLight(0x064f13, 0x064f13, 1.3);

        dir.position.set(5, 1, 2);
        dir.target.position.set(0, 0, 0);

        this.add(ambi, hemi, dir);
    }
}

export default BasicLights;