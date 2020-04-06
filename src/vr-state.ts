import {WebVRController, WebVRFreeCamera, Camera, Vector3} from "@babylonjs/core";
export class VRState {
    valid = false;
    leftController!: WebVRController;
    rightController!: WebVRController;
    camera!: Camera;
    
    constructor() {

    }

    isControllerTwisted() {
        if(this.leftController != null){
            // dot the ray of the controller with the normal of the ground plane to see if its at 90
            // based on which side its on, display either the menu or the palette
            // Playground.moveObjectToCamera(camera as Camera, this.statusPlane, 4, 3);
            var controller = this.leftController;
            let up = new Vector3(0, 1, 0);
            if (controller.mesh?.getWorldMatrix())
                up = Vector3.TransformNormal(new Vector3(0,1,0), controller.mesh?.getWorldMatrix());
            if(Vector3.Dot(up, new Vector3(0,1,0)) < 0.1) {
                // cross product to find the direction
                var cp = Vector3.Cross(up, new Vector3(0,1,0));
                if (Vector3.Dot(cp, this.camera.getForwardRay(1).direction) > 0) {
                    // Twisted Left
                } else {
                    // Twisted Right
                }
            } else {
                // No twist
            }                
        }
    }
};