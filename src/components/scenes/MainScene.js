import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Spiral } from 'objects';
import { BasicLights } from 'lights';
import * as THREE from "three";

import POSX from "./textures/Skybox/posx.jpg";
import NEGX from "./textures/Skybox/negx.jpg";
import POSY from "./textures/Skybox/posy.jpg";
import NEGY from "./textures/Skybox/negy.jpg";
import POSZ from "./textures/Skybox/posz.jpg";
import NEGZ from "./textures/Skybox/negz.jpg";
import RAINBOW from "./textures/Rainbow/rainbow2.png";

class MainScene extends Scene {
    constructor(isMobile, listener) {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            rotationSpeed: 1,
            updateList: [],
        };

        // Set background to a nice color
        this.background = new Color(0x000000);
        // Add spirals to scene

        this.envMap = new THREE.CubeTextureLoader()
            .load([
                POSX, NEGX,
                POSY, NEGY,
                POSZ, NEGZ
            ]);

        // 16


        const lights = new BasicLights();
        this.add(lights);

        this.create_new_spiral = this.create_new_spiral.bind(this);

        // set default low spiral count number that works on mobile
        let count = 4;

        // if site is opened on computer with > GPU, display more spirals
        if (!isMobile) {
            count = 20;
            // count = 30;
        }
        for (let i = 0; i < count; i++) {
            this.create_new_spiral(listener);
        }

    }

    create_new_spiral(listener) {
        const new_spiral = new Spiral(this, listener, this.envMap, 1, 1);
        this.add(new_spiral);

    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    update(timeStamp) {
        const { rotationSpeed, updateList } = this.state;

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default MainScene;