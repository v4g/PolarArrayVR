import { PolarArray } from "./polar-array";
import { Mesh, Quaternion, Vector3, MeshBuilder, Color3, StandardMaterial, Scene, Space, DeepImmutable } from "@babylonjs/core";
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
    ribbon!: Mesh;
    constructor(polar: PolarArray) {
        const scaleVector = polar.axis.scale(polar.height);
        for (let i = 1; i < polar.n_copies; i++) {
            for (let j = 0; j < polar.meshes.length; j++) {
                let newCopy = polar.meshes[j].clone();
                let angle = i * polar.totalAngle / polar.n_copies;
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
        const scaleVector = polar.axis.scale(polar.height);
        for (let i = 1; i < polar.n_copies; i++) {
            for (let j = 0; j < polar.meshes.length; j++) {
                let newCopy = this.copies[(i - 1) * polar.meshes.length + j];
                let angle = i * polar.totalAngle / polar.n_copies;
                let quaternion = Quaternion.RotationAxis(polar.axis, angle);
                let newPosition = new Vector3();
                newCopy.position = polar.meshes[j].position.clone();
                newCopy.position.rotateByQuaternionAroundPointToRef(quaternion, polar.point, newPosition);
                newPosition.addInPlace(scaleVector.scale(i / polar.n_copies));
                newCopy.position = newPosition;
                if (newCopy.rotationQuaternion)
                    newCopy.rotationQuaternion = null;
                newCopy.rotation.copyFrom(polar.meshes[j].rotation);
                if (polar.meshes[j].rotationQuaternion) {
                    newCopy.rotationQuaternion = (polar.meshes[j].rotationQuaternion as Quaternion).clone();
                }
                newCopy.rotate(polar.axis, angle, Space.WORLD);

            }
        }
        this.polarArray = polar;
    }

    renderRibbon() {
        if (this.ribbon) {
            SceneState.getInstance().scene.removeMesh(this.ribbon);
            this.ribbon.dispose();
        }
        const polar = this.polarArray;
        if (this.polarArray.meshes.length > 1) {
            let controlPoints = [];
            for (let j = 0; j < polar.meshes.length; j++) {
                let cp = [];
                cp.push(polar.meshes[j].position.clone());
                for (let i = 1; i < polar.n_copies; i++) {
                    const copy = this.copies[(i - 1) * polar.meshes.length + j];
                    cp.push(copy.position.clone());
                }
                controlPoints.push(cp);
            }
            let close = false;
            if (this.polarArray.height == 0 && this.polarArray.totalAngle > 5 * Math.PI / 6) {
                close = true;
            }
            this.ribbon = MeshBuilder.CreateRibbon("polar" + Math.random() * 100, { pathArray: controlPoints, closePath: close, sideOrientation: Mesh.DOUBLESIDE });
            this.destroyCopies();
            for (let j = 0; j < polar.meshes.length; j++) {
                SceneState.getInstance().scene.removeMesh(polar.meshes[j]);
                polar.meshes[j].dispose();
            }
        }
    }

    destroy() {
        console.log("Destroying this");
        this.destroyCopies();
        SceneState.getInstance().scene.removeMesh(this.axis);
        this.axis.dispose(false, true);
        if (this.ribbon) {
            SceneState.getInstance().scene.removeMesh(this.ribbon);
            this.ribbon.dispose();
        }

    }
    destroyCopies() {
        this.copies.forEach(copy => {
            SceneState.getInstance().scene.removeMesh(copy);
            copy.dispose();
        })        
    }
    finalize() {
        SceneState.getInstance().scene.removeMesh(this.axis);
        this.axis.dispose(false, true);
    }

}