import {WebVRController, WebVRFreeCamera, Camera, Vector3} from "@babylonjs/core";
export class VRState {
    valid = false;
    private _leftController!: WebVRController;
    private _rightController!: WebVRController;
    camera!: Camera;
    head!: WebVRFreeCamera;
    eventValidL = true;
    eventValidR = true;
    lastStateL = false;
    lastStateR = false;
    private btnStateL = false;
    private btnStateR = false;
    private static instance: VRState;
    
    private constructor() {

    }

    static getInstance(): VRState {
        if (!VRState.instance) {
            VRState.instance = new VRState();
        }
        return VRState.instance;
        
    }

    saveState() {
        this.lastStateL = this.btnStateL;
        this.lastStateR = this.btnStateR;
        this.eventValidL = false;
        this.eventValidR = false;
    }
    set leftController(left: WebVRController) {
        this._leftController = left;
        left.onTriggerStateChangedObservable.add((event)=> {
            this.btnStateL = event.pressed;
            // lastStateL contains the state when the UI mode was changing
            // If that was true and the button is now unpresssed, its valid
            if (this.lastStateL == true && !event.pressed && !this.eventValidL) {
                this.eventValidL = true;
            } else if (this.lastStateL == false) {
                this.eventValidL = true;
            }
        })
    }

    get leftController(): WebVRController {
        return this._leftController;
    }
    set rightController(right: WebVRController) {
        this._rightController = right;
        right.onTriggerStateChangedObservable.add((event)=> {
            this.btnStateR = event.pressed;
            // lastStateL contains the state when the UI mode was changing
            // If that was true and the button is now unpresssed, its valid
            if (this.lastStateR == true && !event.pressed && !this.eventValidR) {
                this.eventValidR = true;
            } else if (this.lastStateR == false) {
                this.eventValidR = true;
            }
        })
    }

    get rightController(): WebVRController {
        return this._rightController;
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