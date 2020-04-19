import { Mesh, Vector3 } from "@babylonjs/core";

export class PolarArray {
    totalAngle: number; // the total angle covered by the array
    n_copies: number; // the number of copies of the object to be placed in the scene
    axis: Vector3; //TODO: this should be an axis object replace this
    height: number; // height on the axis the array will extend to
    meshes: Mesh[]; // The mesh being copied
    point: Vector3; // The point around which rotation happens
    constructor(meshes: Mesh[]) {
        this.totalAngle = 2 * Math.PI;
        this.n_copies = 12;
        this.height = 0;
        this.meshes = meshes;
        this.axis = new Vector3();
        this.point = new Vector3();
    }

    // Calculates the point of rotation using the two endpoints
    calculatePointAndAxisOfRotation(lPoint: Vector3, rPoint: Vector3) {
        // Vector from rPosition to mesh center, project that on the axis and
        // then add this projection to the rPosition
        this.axis = rPoint.subtract(lPoint);
        let rToMesh = this.meshes[0].position.subtract(rPoint);
        let projection = Vector3.Dot(rToMesh, this.axis.normalize());
        this.point = rPoint.add(this.axis.scale(projection));  
    }
};