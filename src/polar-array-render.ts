import { PolarArray } from "./polar-array";
import { Mesh, Quaternion } from "@babylonjs/core";
import { SceneState } from './index';

/**
 * Render the polar array
 * TODO: add release function that destroys this object
 */
export class PolarArrayRender {
    copies: Mesh[] = []; // Stores the copies of the mesh
    polarArray: PolarArray;
    constructor(polar: PolarArray) {
        for (let i = 1; i < polar.n_copies; i++) {
            let newCopy = polar.mesh.clone();
            let angle = polar.totalAngle/polar.n_copies;
            let quaternion = Quaternion.RotationAxis(polar.axis, angle);
            newCopy.rotationQuaternion = quaternion;
            this.copies.push(newCopy);
            SceneState.getInstance().scene.addMesh(newCopy);
        }
        this.polarArray = polar;
    }
}