import { PolarArray } from "./polar-array";
import { Mesh, Quaternion, Vector3, MeshBuilder, Color3, StandardMaterial, Scene, Space } from "@babylonjs/core";
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
    AXIS_WIDTH = 0.001;
    AXIS_HEIGHT = 5;
    constructor(polar: PolarArray) {
        console.log("Creating copies");
        const scaleVector = polar.axis.scale(polar.height);
        for (let i = 1; i < polar.n_copies; i++) {
            for (let j = 0; j < polar.meshes.length; j++) {
                let newCopy = polar.meshes[j].clone();
                let angle = i * polar.totalAngle / polar.n_copies;
                // console.log(angle, polar.axis);
                let quaternion = Quaternion.RotationAxis(polar.axis, angle);
                let newPosition = new Vector3();
                newCopy.position.rotateByQuaternionAroundPointToRef(quaternion, polar.point, newPosition);
                newPosition.addInPlace(scaleVector.scale(i / polar.n_copies));
                newCopy.position = newPosition;
                newCopy.rotate(polar.axis, angle, Space.WORLD);
                this.copies.push(newCopy);
                SceneState.getInstance().scene.addMesh(newCopy);

            }
        }
        this.axis = MeshBuilder.CreateCylinder("polarArray" + polar.meshes[0].name, { height: 1, diameter: 2 });
        this.axis.position.copyFrom(polar.point);
        this.axis.scaling.set(this.AXIS_WIDTH, this.AXIS_HEIGHT, this.AXIS_WIDTH);
        this.axis.rotationQuaternion = Helpers.QuaternionFromUnitVectors(Helpers.UP, polar.axis);
        let axisMaterial = new StandardMaterial("axisMaterial", SceneState.getInstance().scene);
        axisMaterial.diffuseColor = this.AXIS_COLOR;
        axisMaterial.alpha = this.AXIS_OPACITY;
        this.axis.material = axisMaterial;
        this.polarArray = polar;
    }

    updateRender(polar: PolarArray) {
        console.log("Creating copies");
        const scaleVector = polar.axis.scale(polar.height);
        for (let i = 1; i < polar.n_copies; i++) {
            for (let j = 0; j < polar.meshes.length; j++) {
                let newCopy = this.copies[(i-1) * polar.meshes.length + j];
                let angle = i * polar.totalAngle / polar.n_copies;
                let quaternion = Quaternion.RotationAxis(polar.axis, angle);
                let newPosition = new Vector3();
                newCopy.position = polar.meshes[j].position.clone();
                newCopy.position.rotateByQuaternionAroundPointToRef(quaternion, polar.point, newPosition);
                newPosition.addInPlace(scaleVector.scale(i / polar.n_copies));
                newCopy.position = newPosition;
            }
        }  
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
    finalize() {
        SceneState.getInstance().scene.removeMesh(this.axis);
        this.axis.dispose(false, true);
    }

}