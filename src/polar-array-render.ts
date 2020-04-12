import { PolarArray } from "./polar-array";
import { Mesh, Quaternion, Vector3, MeshBuilder, Color3, StandardMaterial, Scene } from "@babylonjs/core";
import { SceneState } from './index';
import { Helpers } from "./helpers";

/**
 * Render the polar array
 * TODO: add release function that destroys this object
 */
export class PolarArrayRender {
    private readonly AXIS_COLOR = new Color3(0.5, 0, 0);
    private readonly AXIS_OPACITY = 0.3;

    copies: Mesh[] = []; // Stores the copies of the mesh
    polarArray: PolarArray;
    axis: Mesh;
    AXIS_WIDTH = 0.01;
    AXIS_HEIGHT = 1;
    constructor(polar: PolarArray) {
        console.log("Creating copies");
        const scaleVector = polar.axis.scale(polar.height);
        for (let i = 1; i < polar.n_copies; i++) {
            let newCopy = polar.mesh.clone();
            let angle = i * polar.totalAngle/polar.n_copies;
            // console.log(angle, polar.axis);
            let quaternion = Quaternion.RotationAxis(polar.axis, angle);
            let newPosition = new Vector3();
            newCopy.position.rotateByQuaternionAroundPointToRef(quaternion, polar.point, newPosition);
            newPosition.addInPlace(scaleVector.scale(i / polar.n_copies));
            newCopy.position = newPosition;

            this.copies.push(newCopy);
            SceneState.getInstance().scene.addMesh(newCopy);
        }
        this.axis = MeshBuilder.CreateCylinder("polarArray"+polar.mesh.name, {height: 1, diameter: 2});
        this.axis.position.copyFrom(polar.point);
        this.axis.scaling.set(this.AXIS_WIDTH, this.AXIS_HEIGHT, this.AXIS_WIDTH);
        this.axis.rotationQuaternion = Helpers.QuaternionFromUnitVectors(Helpers.UP, polar.axis);
        let axisMaterial = new StandardMaterial("axisMaterial", SceneState.getInstance().scene);
        axisMaterial.diffuseColor = this.AXIS_COLOR;
        axisMaterial.alpha = this.AXIS_OPACITY;
        this.axis.material = axisMaterial;
        this.polarArray = polar;
    }

    destroy() {
        this.copies.forEach(copy => {
            SceneState.getInstance().scene.removeMesh(copy);
            copy.dispose();
        })
        SceneState.getInstance().scene.removeMesh(this.axis);
        this.axis.dispose(false, true);
    }


}