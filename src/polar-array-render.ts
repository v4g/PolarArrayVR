import { PolarArray } from "./polar-array";
import { Mesh, Quaternion, Vector3 } from "@babylonjs/core";
import { SceneState } from './index';

/**
 * Render the polar array
 * TODO: add release function that destroys this object
 */
export class PolarArrayRender {
    copies: Mesh[] = []; // Stores the copies of the mesh
    polarArray: PolarArray;
    constructor(polar: PolarArray) {
        console.log("Creating copies");
        for (let i = 1; i < polar.n_copies; i++) {
            let newCopy = polar.mesh.clone();
            let angle = i * polar.totalAngle/polar.n_copies;
            console.log(angle, polar.axis);
            let quaternion = Quaternion.RotationAxis(polar.axis, angle);
            let newPosition = new Vector3();
            newCopy.position.rotateByQuaternionAroundPointToRef(quaternion, polar.point, newPosition);
            newCopy.position.copyFrom(newPosition);
            this.copies.push(newCopy);
            SceneState.getInstance().scene.addMesh(newCopy);
        }
        this.polarArray = polar;
    }
}