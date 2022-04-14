import { Group, Scene } from "three";
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import * as THREE from "three";

class Spiral extends Group {
    constructor(parent, envMap, x, z, max_iter, direction, y_squish, y_flip, warp) {
        // Call parent Group() constructor
        super();

        // Init state
        this.state = {
            // gui: parent.state.gui,
            bob: false,
            spin: this.spin.bind(this),
            // twirl: 0,

        };

        this.x = x;
        this.z = z;

        this.initTimestamp = 0;
        this.translationFactor = 2.0 / 300;
        this.rotationSpeed = 0.1;
        //     this.pivot = new THREE.Group();
        //   pivot.position.set( x, 0, z );
        //   this.add(this.pivot);

        // 50 3
        this.shrink_factor = 1;
        // orig 2
        // 0.5
        this.y_squish = y_squish * y_flip;
        // this.y_offset = 30 * y_flip;
        // 31
        this.y_offset = -1;

        // flower
        // 0.3
        this.warp = warp;

        // triangle
        // this.warp = 1.1;

        let initY = 0;
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

        // start and end points of curve
        // x0 y0 z0 x1 y1 z1
        this.corners = [];
        this.bezier_curves = [];
        this.cubes = [];
        this.curveGroup0 = new THREE.Group();
        this.curveGroup1 = new THREE.Group();
        this.bubbleGroup = new THREE.Group();
        this.cm_curves = [];
        this.bubbles = [];
        this.points = [];

        this.fibonacci = [];
        this.cumulative = [];

        this.curveGroup0.position.set(x, 0, z);
        this.curveGroup1.position.set(x, 0, z);



        parent.addToUpdateList(this);
        this.calculate = this.calculate.bind(this);
        this.create_cube = this.create_cube.bind(this);
        this.rotate_bezier = this.rotate_bezier.bind(this);
        this.draw_bezier = this.draw_bezier.bind(this);
        this.draw_catmull_rom = this.draw_catmull_rom.bind(this);
        this.draw_line = this.draw_line.bind(this);
        this.draw_bubbles = this.draw_bubbles.bind(this);
        this.draw_cubes = this.draw_cubes.bind(this);

        this.calculate(max_iter, direction);
        this.draw_bezier();
        // this.draw_cubes();
        // this.draw_bubbles();
        // this.draw_line();
    }




    rotate_bezier(degrees) {
        // interesting effect
        // const myAxis = new THREE.Vector3(1, 0, 0);
        // const myAxis = new THREE.Vector3(0, 1, 0);
        const myAxis = new THREE.Vector3(10, 0, 0);

        // this.curveGroup0.applyMatrix(new THREE.Matrix4().makeTranslation(this.x, 1, this.z));
        // var q = new THREE.Quaternion();
        // q.setFromAxisAngle(myAxis, THREE.MathUtils.degToRad(degrees));
        // this.curveGroup0.applyQuaternion(q);

        this.curveGroup0.rotateY(THREE.MathUtils.degToRad(degrees));
        this.curveGroup1.rotateY(THREE.MathUtils.degToRad(degrees));
        // this.curveGroup1.rotateOnWorldAxis(myAxis, THREE.MathUtils.degToRad(degrees));
        // this.bubbleGroup.rotateOnWorldAxis(myAxis, THREE.MathUtils.degToRad(degrees));

        // THREE.Object3D.prototype.rotateOnWorldAxis = function() {

        //     // rotate object on axis in world space
        //     // axis is assumed to be normalized
        //     // assumes object does not have a rotated parent

        //     var q = new THREE.Quaternion();

        //     return function rotateOnWorldAxis( axis, angle ) {

        //         q.setFromAxisAngle( axis, angle );

        //         this.applyQuaternion( q );

        //         return this;

        //     }

        // }();
    }

    draw_bezier() {
        let data;
        let radius;
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
            // console.log(path);
            // const points = path.getPoints(3);
            // this.points.push(points[1]);
            // this.points.push(points[2]);
            // this.points.push(points[3]);
            // path, tubularSsegments, radius, radialsegments
            const curveGeometry = new THREE.TubeGeometry(path, 20, radius, 8, false);
            // const curveGeometry = new THREE.TubeGeometry(path, 20, 1, 8, false);
            // const curveObject = new THREE.Line(curveGeometry, material);
            const curveMesh = new THREE.Mesh(curveGeometry, this.tubeMaterial);
            this.add(curveMesh);
            this.bezier_curves.push(curveMesh);
            this.curveGroup0.add(curveMesh);

            path = new THREE.QuadraticBezierCurve3(
                new THREE.Vector3(-data[0], data[1] + this.y_offset, data[2]), // start
                new THREE.Vector3(-data[6], data[7] + this.y_offset, data[8]), // control
                new THREE.Vector3(-data[3], data[4] + this.y_offset, data[5]) // end
            );
            // points = path.getPoints(3);
            // this.points.push(points[1]);
            // this.points.push(points[2]);
            // this.points.push(points[3]);
            // path, tubularSsegments, radius, radialsegments
            curveGeometry = new THREE.TubeGeometry(path, 20, radius, 8, false);
            // const curveGeometry = new THREE.TubeGeometry(path, 20, 1, 8, false);
            // const curveObject = new THREE.Line(curveGeometry, material);
            curveMesh = new THREE.Mesh(curveGeometry, this.tubeMaterial);
            this.add(curveMesh);
            this.bezier_curves.push(curveMesh);
            this.curveGroup1.add(curveMesh);

        }
        this.add(this.curveGroup0);
        this.add(this.curveGroup1);
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

    draw_catmull_rom() {
        // CATMULL ROM CURVE
        let vectors = [];
        let data;
        for (let i in this.corners) {
            data = this.corners[i];
            vectors.push(new THREE.Vector3(data[0], data[1], data[2]));
        }
        data = this.corners[this.corners.length - 1]
        vectors.push(new THREE.Vector3(data[3], data[4], data[5]));

        const curve = new THREE.CatmullRomCurve3(vectors);
        const points = curve.getPoints(100);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);

        const curveObject = new THREE.Line(curveGeometry, this.lineMaterial);
        this.add(curveObject);
    }

    draw_line() {
        for (let i in this.corners) {
            const data = this.corners[i];

            const points = [];
            points.push(new THREE.Vector3(data[0], data[1], data[2]));
            points.push(new THREE.Vector3(data[3], data[4], data[5]));

            const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

            const line = new THREE.Line(lineGeometry, this.lineMaterial);
            this.add(line);
        }
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
                    z = (f1z + f0z - (f0 / 2)) / 2;
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

    }

    update(timeStamp) {
        this.curveGroup0.rotateY(this.rotationSpeed);
        this.curveGroup1.rotateY(-this.rotationSpeed);
        // this.bubbleGroup.rotateY(this.rotationSpeed);


    }
}

export default Spiral;