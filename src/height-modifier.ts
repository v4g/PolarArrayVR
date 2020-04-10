import {Mesh, MeshBuilder, DeepImmutable, Vector3} from "@babylonjs/core";
import {PolarArray} from "./polar-array";
import { VRState } from "./vr-state";
import { PolarArrayManager } from "./polar-array-manager";

export class HeightModifier{ 
    private heightModifier: Mesh;

    private HEIGHT_MODIFIER_SIZE = 0.1;
    private listener: any;
    private point = new Vector3();
    private axis = new Vector3();
    private isHeld = false;

    constructor() {
        this.heightModifier = MeshBuilder.CreateSphere("HeightModifier", {diameter: this.HEIGHT_MODIFIER_SIZE});  
        this.disable();
        this.listener = this.rControllerCallback.bind(this);
    }

    disable() {
        this.heightModifier.isVisible = false;
        this.heightModifier.isPickable = false;
        this.heightModifier.setEnabled(false);
        this.isHeld = false;
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.listener);
    }
    enable(polar: PolarArray) {
        let position = polar.point.add(polar.axis.scale(polar.height));
        this.heightModifier.position.copyFrom(position);
        this.heightModifier.isVisible = true;
        this.heightModifier.isPickable = true;
        this.heightModifier.setEnabled(true);   
        this.point.copyFrom(polar.point);
        this.axis.copyFrom(polar.axis); 
        VRState.getInstance().rightController.onTriggerStateChangedObservable.add(this.listener);
    }
    rControllerCallback(event: any) {
        if (!event.pressed) {
            this.isHeld = false;
            return;
        }
        const controller = VRState.getInstance().rightController;
        const intersection = controller.getForwardRay(5).intersectsMesh(this.heightModifier as DeepImmutable<Mesh>);
        if (intersection.hit || this.isHeld) {
            const ray = controller.getForwardRay(5);
            let pToC = this.point.subtract(ray.origin);
            let planeProjection = ray.origin.add(ray.direction.scale(Vector3.Dot(pToC, ray.direction)));
            let planeProjectionX = planeProjection.subtract(this.point);
            let height = Vector3.Dot(planeProjectionX, this.axis);
            this.heightModifier.position.copyFrom(this.point.add(this.axis.scale(height)));
            PolarArrayManager.getInstance().setHeight(height);
        }
        this.isHeld = true;        
    }

}