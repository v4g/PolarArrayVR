import { Vector3, Quaternion, Camera, Mesh, WebVRFreeCamera, TargetCamera } from "@babylonjs/core";

export class Helpers {
    static readonly UP = new Vector3(0, 1, 0);
    static QuaternionFromUnitVectors(v1: Vector3, v2: Vector3): Quaternion {
        let axis = v1.cross(v2);
        let angle = Vector3.GetAngleBetweenVectors(v1, v2, axis);
        return Quaternion.RotationAxis(axis, angle);
    }
    static lookAtCamera(camera: Camera, plane: Mesh) {
        let distance = 5;
        if (camera instanceof WebVRFreeCamera) {
            let CCamera = plane.position.subtract(camera.globalPosition).scale(-1);
            const quaternion = Helpers.QuaternionFromUnitVectors(this.UP, CCamera.normalize());
            plane.rotationQuaternion = quaternion;
        }
        else {
            camera = (camera as TargetCamera);

            if (camera instanceof TargetCamera) {
                var forward = new Vector3().copyFrom(camera.getTarget()).subtract(camera.position).normalize();
                // have to do this because lookat flips it horizontallly
                var flipped_position = forward.scale(2 * distance).add(camera.position);
                plane.lookAt(flipped_position);
            }
        }
    }
    static moveObjectToCamera(camera: Camera, plane: Mesh, distance = 5, y_offest = 0) {
        if (camera instanceof WebVRFreeCamera) {
            camera = camera as WebVRFreeCamera;
            var forward = camera.getForwardRay(5).direction.scaleInPlace(distance);
            var new_position = camera.globalPosition.add(forward);
            new_position.y += y_offest;
            plane.position.copyFrom(new_position);
            var flipped_position = forward.scale(2).add(camera.globalPosition);
            plane.lookAt(flipped_position);
        }
        else {
            camera = (camera as TargetCamera);

            if (camera instanceof TargetCamera) {
                var forward = new Vector3().copyFrom(camera.getTarget()).subtract(camera.position).normalize();
                var new_position = forward.scale(distance).add(camera.position);
                plane.position.copyFrom(new_position);
                // have to do this because lookat flips it horizontallly
                var flipped_position = forward.scale(2 * distance).add(camera.position);
                plane.lookAt(flipped_position);
            }
        }
    }

}