import { Mesh, Vector3 } from "@babylonjs/core";

export class PolarArray {
    totalAngle: number; // the total angle covered by the array
    n_copies: number; // the number of copies of the object to be placed in the scene
    axis: Vector3; //TODO: this should be an axis object replace this
    height: number; // height on the axis the array will extend to
    mesh: Mesh; // The mesh being copied
    constructor(mesh: Mesh) {
        this.totalAngle = 2 * Math.PI;
        this.n_copies = 12;
        this.height = 0;
        this.mesh = mesh;
        this.axis = new Vector3();
    }
};