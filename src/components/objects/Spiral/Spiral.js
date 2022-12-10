import { Group, Scene } from "three";
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from "three";

class Spiral extends Group {
    constructor(parent, listener, envMap, direction, y_flip) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // gui: parent.state.gui,
            bob: false,
            spin: this.spin.bind(this),
            // twirl: 0,

        };

        this.x;
        this.z;

        this.initTimestamp = 0;
        this.translationFactor = 2.0 / 300;
        this.rotationSpeed;

        // 50 3
        this.shrink_factor = 1;
        // orig 2
        // 0.5
        this.y_squish = y_flip;
        // this.y_offset = 30 * y_flip;
        // 31
        this.y_offset = -1;

        this.warp;

        this.num_spirals = 8;

        this.name = "SPIRAL";


        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000
        });
        this.tubeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd505,
            // color: 0xffffff,
            // 0x333333
            // emissive: 0x333333,
            emissive: 0x000000,
            metalness: 1.5, // between 0 and 1
            roughness: 0, // between 0 and 1
            envMap: envMap,
            envMapIntensity: 1.6
        });

        // const RED = 0xff8e88;
        // const ORANGE = 0xfeba4f;
        // const YELLOW = 0xffe983;
        // const GREEN = 0x77dd77;
        // const BLUE = 0x0da2ff;
        // const INDIGO = 0x6666ff;
        // const VIOLET = 0x9966ff;
        // const GREY = 0xffffff;

        // this.tubeMaterial = new THREE.MeshPhongMaterial({
        //     color: VIOLET,
        //     envMap: envMap,
        //     refractionRatio: 0.7,
        //     specular: 0xffffff,
        //     shininess: 1000
        // });

        // this.tubeMaterial.envMap.mapping = THREE.CubeRefractionMapping;

        // start and end points of curve
        // x0 y0 z0 x1 y1 z1
        this.corners = [];
        this.cubes = [];
        this.curve_group_0 = [];
        this.curve_group_1 = [];
        this.spiral_group_0 = new THREE.Group();
        this.spiral_group_1 = new THREE.Group();
        this.bubbleGroup = new THREE.Group();
        this.cm_curves = [];
        this.bubbles = [];
        this.points = [];

        this.fibonacci = [];
        this.cumulative = [];






        parent.addToUpdateList(this);
        this.init_params = this.init_params.bind(this);
        this.calculate = this.calculate.bind(this);
        this.create_cube = this.create_cube.bind(this);
        this.draw_bezier = this.draw_bezier.bind(this);
        this.draw_bubbles = this.draw_bubbles.bind(this);
        this.draw_cubes = this.draw_cubes.bind(this);

        this.init_params();
        this.calculate(this.max_iter, direction);

        for (let i = 0; i < this.num_spirals; i++) {
            this.curve_group_0.push(new THREE.Group());
            this.curve_group_1.push(new THREE.Group());
            this.draw_bezier(i);

        }
        this.add(this.spiral_group_0);
        this.add(this.spiral_group_1);

        // const sound3 = new THREE.PositionalAudio(listener);
        // const oscillator = listener.context.createOscillator();
        // oscillator.type = 'sine';
        // oscillator.frequency.setValueAtTime(144 * this.warp, sound3.context.currentTime);
        // oscillator.start(0);
        // sound3.setNodeSource(oscillator);
        // sound3.setRefDistance(20);
        // sound3.setVolume(0.5);
        // this.spiral_group_0.add(sound3);

        // const analyser3 = new THREE.AudioAnalyser(sound3, 32);
        // this.warp = analyser3.getAverageFrequency() / 256;


    }

    init_params() {
        // Math.floor(Math.random() * (max - min) + min)

        this.max_iter = Math.floor(Math.random() * (5) + 4);
        // 160 8
        this.x = Math.floor(Math.random() * (160) - 80);
        this.z = Math.floor(Math.random() * (160) - 80);

        // this.rotationSpeed = -0.01;
        this.rotationSpeed = -Math.floor(Math.random() * (3) + 1) / 100; // 0.01 to 0.05
        this.num_spirals = Math.floor(Math.random() * (28) + 8);
        this.warp = Math.floor(Math.random() * (19) + 3) / 10; // 0.2 to 2.0
        this.shrink_factor = Math.floor(Math.random() * (2) + 8) / 10; //0.5 to 1
        this.y_squish *= Math.floor(Math.random() * (12) + 3) / 10; // 0.3 - 2

        // this.max_iter = 7;
        // this.x = 0;
        // this.z = 0;
        // this.rotationSpeed = 0;
        // this.num_spirals = 16;
        // this.warp = 0.4;
        // this.shrink_factor = 0.5;
        // this.y_squish = 0.3;


        this.spiral_group_0.position.set(this.x, 0, this.z);
        this.spiral_group_1.position.set(this.x, 0, this.z);

        // const golden_ratio_conjugate = 0.618033988749895
        // let h = Math.random();
        // h += golden_ratio_conjugate;
        // h %= 1
        // hsv_to_rgb(h, 0.5, 0.95)

        // this.tubeMaterial.color.setHex(Math.floor(Math.random() * 16777215).toString(16));

        // console.log(Math.floor(Math.random() * 16777215).toString(16));

    }

    draw_bezier(index) {
        let data;
        let radius;
        const degrees = index * (360 / this.num_spirals)

        // let spiral0 = new THREE.Group();
        // let spiral1 = new THREE.Group();
        for (let i in this.corners) {
            // 7 5
            if (i == 0) {
                radius = 1 / 7;
            } else {
                radius = i / 5;
            }
            data = this.corners[i];

            const path = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(data[0], data[1] + this.y_offset, data[2]), // start
                new THREE.Vector3(data[6], data[7] + this.y_offset, data[8]), // control
                new THREE.Vector3(data[3], data[4] + this.y_offset, data[5]) // end
            );

            // path, tubularSsegments, radius, radialsegments
            const curveGeometry = new THREE.TubeGeometry(path, 20, radius, 8, false);
            const curveMesh = new THREE.Mesh(curveGeometry, this.tubeMaterial);
            this.add(curveMesh);
            // spiral0.add(curveMesh);
            this.curve_group_0[index].add(curveMesh);

            path = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(-data[0], data[1] + this.y_offset, data[2]), // start
                new THREE.Vector3(-data[6], data[7] + this.y_offset, data[8]), // control
                new THREE.Vector3(-data[3], data[4] + this.y_offset, data[5]) // end
            );

            curveGeometry = new THREE.TubeGeometry(path, 20, radius, 8, false);
            curveMesh = new THREE.Mesh(curveGeometry, this.tubeMaterial);
            this.add(curveMesh);
            // spiral1.add(curveMesh);
            this.curve_group_1[index].add(curveMesh);

            this.curve_group_0[index].rotateY(THREE.MathUtils.degToRad(degrees));
            this.curve_group_1[index].rotateY(THREE.MathUtils.degToRad(degrees));
        }
        this.add(this.curve_group_0[index]);
        this.add(this.curve_group_1[index]);
        this.spiral_group_0.add(this.curve_group_0[index]);
        this.spiral_group_1.add(this.curve_group_1[index]);

    }

    draw_bubbles(degrees) {
        // let data;
        // const myAxis = new THREE.Vector3(0, 1, 0);
        // for (let i in this.points) {
        //     // if (i >140) {
        //     data = this.points[i];
        //     const geometry = new THREE.SphereGeometry(5, 32, 16);
        //     const sphere = new THREE.Mesh(geometry, this.tubeMaterial);
        //     sphere.position.set(data.x, data.y, data.z);
        //     sphere.rotateOnWorldAxis(myAxis, THREE.MathUtils.degToRad(degrees));
        //     sphere.matrixAutoUpdate = false;
        //     sphere.updateMatrix();
        //     this.bubbles.push(sphere);
        //     this.bubbleGroup.add(sphere);
        //     // }

        // }
        // this.add(this.bubbleGroup);
        let data;
        const myAxis = new THREE.Vector3(0, 1, 0);
        for (let i in this.corners) {
            data = this.corners[i];
            // const geometry = new THREE.SphereGeometry(i * i * i * i / (this.shrink_factor * 70), 32, 16);

            const geometry = new THREE.SphereGeometry(2, 32, 16);
            const sphere = new THREE.Mesh(geometry, this.tubeMaterial);
            sphere.position.set(data[3], this.y_offset + data[4], data[5]);
            sphere.rotateOnWorldAxis(myAxis, THREE.MathUtils.degToRad(degrees));
            sphere.matrixAutoUpdate = false;
            sphere.updateMatrix();
            this.bubbles.push(sphere);
            this.bubbleGroup.add(sphere);

        }
        this.add(this.bubbleGroup);
    }

    create_cube(num, sum, x, y, z) {
        num /= this.shrink_factor;
        sum /= this.shrink_factor;
        x /= this.shrink_factor;
        y /= this.shrink_factor;
        z /= this.shrink_factor;
        const geometry = new THREE.BoxGeometry(num, num / this.y_squish, num);
        var geo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry( geometry )
        var mat = new THREE.LineBasicMaterial({ color: 0xffffff });
        var wireframe = new THREE.LineSegments(geo, mat);
        wireframe.position.set(x, this.y_offset + y / this.y_squish, z);
        return wireframe;
    }

    draw_cubes() {
        for (let cube in this.cubes) {
            this.add(this.cubes[cube]);
        }
    }

    spin() {
        console.log("spin")
    }

    // 300000
    // 200000 surface

    calculate(max_iter, direction) {
        // 1 1 2 3 5 8 13
        // max 190
        let f0 = 0;
        let f1 = 1;
        let num;
        let sum = 0;
        let newCube;
        let dir = 0;
        let f0x = 0;
        let f1x = 1;
        let f0z = 0;
        let f1z = 0;
        let x = 0;
        let y = 0;
        let z = 0;
        let factor0 = 0;
        let factor1 = 0.25;
        let factor = 0;

        let x0, y0, z0, x1, y1, z1;
        let xb, yb, zb;
        for (let i = 0; i < max_iter; i++) {

            num = f0 + f1;

            if (i == 3) {
                factor = 0.25;
            }
            if (i > 3) {
                factor = factor0 + factor1;
                factor0 = factor1;
                factor1 = factor;
            }

            if (i > 1) {
                // E
                if (dir == 0) {
                    // console.log("E");
                    x = f1x + (f1 / 2) + (num / 2);
                    z = (f0z + f1z) / 2 + (factor);
                }
                // N
                if (dir == 1) {
                    // console.log("N");
                    x = (f0x + f1x) / 2 + (factor);
                    z = f1z - (f1 / 2) - (num / 2);
                }
                // W
                if (dir == 2) {
                    // console.log("W");
                    x = f1x - (f1 / 2) - (num / 2);
                    z = (f1z + f0z) / 2 - (factor);
                }
                // S
                if (dir == 3) {
                    // console.log("S");
                    x = (f0x + f1x) / 2 - (factor);
                    z = f1z + (f1 / 2) + (num / 2);
                }

                f0x = f1x;
                f0z = f1z;
                f1x = x;
                f1z = z;

                if (dir == 3) {
                    dir = 0;
                } else {
                    dir++;
                }
            } else if (i == 0) {
                x = f0x;
                z = f0z;
            } else if (i == 1) {
                x = f1x;
                z = f1z;
                dir++;
            }

            y = -(sum + num / 2.0);

            this.cubes.push(this.create_cube(num, sum, direction * x, this.y_offset + y, z));

            // calculate corner coordinates 

            y0 = y + (num / 2.0);
            y1 = y - (num / 2.0);
            if (i == 0) {
                x0 = -0.5;
                y0 = 0;
                z0 = -0.5;
                x1 = 0.5;
                y1 = -1;
                z1 = 0.5;
                xb = x0;
                yb = y0;
                zb = z1;
            } else if (dir == 0) {
                x0 = x - (num / 2.0);
                z0 = z - (num / 2.0);
                x1 = x + (num / 2.0);
                z1 = z + (num / 2.0);
                xb = x0;
                yb = y0;
                zb = z1;
            } else if (dir == 1) {
                x0 = x - (num / 2.0);
                z0 = z + (num / 2.0);
                x1 = x + (num / 2.0);
                z1 = z - (num / 2.0);
                xb = x1;
                yb = y0;
                zb = z0;
            } else if (dir == 2) {
                x0 = x + (num / 2.0);
                z0 = z + (num / 2.0);
                x1 = x - (num / 2.0);
                z1 = z - (num / 2.0);
                xb = x0;
                yb = y0;
                zb = z1;
            } else if (dir == 3) {
                x0 = x + (num / 2.0);
                z0 = z - (num / 2.0);
                x1 = x - (num / 2.0);
                z1 = z + (num / 2.0);
                xb = x1;
                yb = y0;
                zb = z0;
            }
            yb = (y0 + y1) / 2;

            x0 /= this.shrink_factor * direction;
            y0 /= this.shrink_factor;
            z0 /= this.shrink_factor;
            x1 /= this.shrink_factor * direction;
            y1 /= this.shrink_factor;
            z1 /= this.shrink_factor;
            xb /= this.warp * this.shrink_factor * direction;
            yb /= this.shrink_factor;
            zb /= this.warp * this.shrink_factor;
            y0 /= this.y_squish;
            y1 /= this.y_squish;
            yb /= this.y_squish;

            if (i == 0) {
                this.corners.push([0, y0, 0, x1, y1, z1, xb, yb, zb]);
            } else {
                this.corners.push([x0, y0, z0, x1, y1, z1, xb, yb, zb]);

            }

            if (i == 0) {
                sum = 1;
            }
            if (i > 0) {
                f0 = f1;
                f1 = num;
                sum += num;
            }

            this.fibonacci.push(num);
            if (i == 0) {
                this.cumulative.push(num);
            } else {
                this.cumulative.push(this.cumulative[this.cumulative.length - 1] + num);
            }


        }

        this.y_offset *= this.corners[this.corners.length - 1][4] + 0.3;
        this.y_offset -= 50;
    }

    update(timeStamp) {
        this.spiral_group_0.rotateY(this.rotationSpeed);
        this.spiral_group_1.rotateY(-this.rotationSpeed);
        // this.bubbleGroup.rotateY(this.rotationSpeed);


    }
}

export default Spiral;