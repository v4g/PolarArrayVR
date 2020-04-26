import {WebVRController, WebVRFreeCamera, Camera, Vector3} from "@babylonjs/core";
import { SceneState } from ".";
import { OBJExport} from "@babylonjs/serializers";
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
    private zoomTrigger = new SecondaryTriggerState();
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
        });
        left.onButtonStateChange((controlledIndex, index, state) => {
            if (index == 2) {
                this.secondaryTriggerL(state);
            }
        });
        SceneState.getInstance().beforeRender.set("VRState", this.beforeRender.bind(this));
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
        right.onPadStateChangedObservable.add((event)=> {
            if(event.pressed) {
                const obj = OBJExport.OBJ(SceneState.getInstance().allMeshes, false, undefined, true);
                console.log(obj);
            }
            
        });
        
        right.onButtonStateChange((controlledIndex, index, state) => {
            if (index == 2) {
                this.secondaryTriggerR(state);
            }
        });
    }

    get rightController(): WebVRController {
        return this._rightController;
    }

    secondaryTriggerL(event: any) {
        if (event.pressed) {
            this.zoomTrigger.isSecondaryTriggerHeldL = true;
            if (this.zoomTrigger.isSecondaryTriggerHeldR && !this.zoomTrigger.isZooming) {
                this.zoomTrigger.isZooming = true;
                this.zoomTrigger.zoomVector = this.leftController.devicePosition.subtract(this.rightController.devicePosition);
            }
        } else {
            this.zoomTrigger.isSecondaryTriggerHeldL = false;
            this.zoomTrigger.isZooming = false;
        }
    }
    secondaryTriggerR(event: any) {
        if (event.pressed) {
            this.zoomTrigger.isSecondaryTriggerHeldR = true;
            if (this.zoomTrigger.isSecondaryTriggerHeldL && !this.zoomTrigger.isZooming) {
                this.zoomTrigger.isZooming = true;
                this.zoomTrigger.zoomVector = this.leftController.devicePosition.subtract(this.rightController.devicePosition);
            }
        } else {
            this.zoomTrigger.isZooming = false;
            this.zoomTrigger.isSecondaryTriggerHeldR = false;
        }
    }

    beforeRender() {
        if (this.zoomTrigger.isZooming) {
            const vec = this.leftController.devicePosition.subtract(this.rightController.devicePosition);
            const zoom = vec.length() - this.zoomTrigger.zoomVector.length();
            const ray = (this.camera as WebVRFreeCamera).getForwardRay(1);
            (this.camera as WebVRFreeCamera).position.addInPlace(ray.direction.scale(zoom));   
        }
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

class SecondaryTriggerState {
    isSecondaryTriggerHeldL = false;
    isSecondaryTriggerHeldR = false;
    isZooming = false;
    zoomVector = new Vector3();
}