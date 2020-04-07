import { Vector3, Quaternion } from "@babylonjs/core";

export class Helpers {
    static readonly UP = new Vector3(0, 1, 0);
    static QuaternionFromUnitVectors(v1: Vector3, v2: Vector3): Quaternion {
        let axis = v1.cross(v2);
        let angle = Vector3.GetAngleBetweenVectors(v1,v2,axis);
        return Quaternion.RotationAxis(axis, angle);
    }
}