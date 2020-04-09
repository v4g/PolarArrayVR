import {Mesh, MeshBuilder, Vector3, DeepImmutable, AbstractMesh} from "@babylonjs/core";
import {Helpers} from "./helpers";
import { VRState } from "./vr-state";
/**
 * This is a Mesh that looks like a protractor and will allow the user to select an angle
 */
export class Protractor {
    private readonly HEIGHT = 0.1;
    private readonly DIAMETER = 0.5;
    private readonly ZERO_VEC = new Vector3(0, 0, 1);
    private callback: any;
    
    private _angle = 0;
    private mesh: Mesh;
    
    constructor() {
        this.mesh = MeshBuilder.CreateCylinder("protractor", {height: this.HEIGHT, diameter: this.DIAMETER});
        this.callback = this.inputListener.bind(this);
    }

    set angle(radians: number) {
        this._angle = radians;
    }

    get angle(): number {
        return this._angle;
    }

    setPosition(vec: Vector3) {
        this.mesh.position.copyFrom(vec);
    }

    /**
     * Sets the angle of the protractor to the one given by the vector in world coordinates
     * @param vec point on the mesh in world co-ordinates
     */
    setAngleFromPoint(vec: Vector3) {
        let arrow_world = vec.subtract(this.mesh.position);
        let arrow_local = Vector3.TransformCoordinates(vec,this.mesh.getWorldMatrix());
        let angle = Vector3.GetAngleBetweenVectors(this.ZERO_VEC, arrow_local, Helpers.UP);
        this.angle = angle;
        console.log("the angle is", angle);
    }

    enable() {
        this.mesh.isPickable = true;
        this.mesh.isVisible = true;
        this.mesh.setEnabled(true);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.add(this.callback);
    }
    disable() {
        this.mesh.isPickable = false;
        this.mesh.isVisible = false;
        this.mesh.setEnabled(false);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.callback);
    }

    /**
     * This method will listen to any input events from the VR controller
     * It should set the angle corresponding to the point clicked on the mesh
     * @param event 
     */
    inputListener(event: any) {
        const mesh = this.mesh;
        if (!event.pressed)
            return;
        const intersection = VRState.getInstance().rightController.getForwardRay(5).intersectsMesh(mesh as DeepImmutable<AbstractMesh>);
        if (intersection.hit) {
            console.log("Protractor was hit");
            this.setAngleFromPoint(intersection.pickedPoint as Vector3);
        } else {
            console.log("Protractor was not hit");
        }
    }
}