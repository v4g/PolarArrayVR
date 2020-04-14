import { VRState } from './vr-state';
import { MeshBuilder, Mesh, Vector3, CubeMapToSphericalPolynomialTools, StandardMaterial, Color3 } from '@babylonjs/core';
import { SceneState } from './index';
import { AxisModeState } from './polar-array-gui';

export class BoxSelection {
    private readonly BOX_COLOR = new Color3(0.1, 0.1, 0.1);
    private readonly BOX_ALPHA = 0.2;
    private axisState = new AxisModeState();
    private box: Mesh;
    private _callback!: (mesh: Mesh[]) => void;
    private oldPressL = 0;
    private oldPressR = 0;
    private boxMaterial: StandardMaterial;

    constructor() {
        this.box = MeshBuilder.CreateBox("SelectionBox", {});
        this.boxMaterial = new StandardMaterial("boxMaterial", SceneState.getInstance().scene)
        this.boxMaterial.diffuseColor = this.BOX_COLOR;
        this.boxMaterial.alpha = this.BOX_ALPHA;
        this.box.material = this.boxMaterial;
    }
    set callback(callback: (meshes: Mesh[]) => void) {
        this._callback = callback;
    }
    axisModeButtonListenerL(event: any) {
        // console.log(event.pressed);
        if (!event.pressed || !VRState.getInstance().eventValidL)
            return;
        if (new Date().getTime() - this.oldPressL > 500) {
            this.axisState.leftDecided = true;
            this.axisState.lPosition = VRState.getInstance().leftController.devicePosition.clone();
            console.log("L Button was Pressed");
        }
    }
    axisModeButtonListenerR(event: any) {
        if (!event.pressed || !VRState.getInstance().eventValidR)
            return;
        if (new Date().getTime() - this.oldPressR > 500) {
            this.oldPressR = new Date().getTime();
            console.log("R Button Pressed");
            this.axisState.rightDecided = true;
            this.axisState.rPosition = VRState.getInstance().rightController.devicePosition.clone();
        }
    }

    boxDecided() {
        const allMeshes = SceneState.getInstance().allMeshes;
        const intersected: Mesh[] = [];
        console.log("Box Decided")
        allMeshes.forEach(mesh => {
            if (this.box.intersectsMesh(mesh) || this.box.intersectsPoint(mesh.position)) {
                intersected.push(mesh);
            }
        });
        this._callback(intersected);
    }

    enable() {
        this.axisState = new AxisModeState();
        // console.log(this.axisState.leftDecided, this.axisState.rightDecided);
        SceneState.getInstance().scene.addMesh(this.box);
        SceneState.getInstance().beforeRender.set("selectionMode", this.beforeRender.bind(this));

        // This is the position selected by the user where they want the endpoints to be
        // It is device position right now because the user hasn't fixed it
        this.axisState.lPosition = VRState.getInstance().leftController.devicePosition;
        this.axisState.rPosition = VRState.getInstance().rightController.devicePosition;

        // Set listener functions for the controller buttons to know when it has ended
        this.axisState.lObservable = this.axisModeButtonListenerL.bind(this);
        this.axisState.rObservable = this.axisModeButtonListenerR.bind(this);
        VRState.getInstance().leftController.onTriggerStateChangedObservable.add(this.axisState.lObservable);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.add(this.axisState.rObservable);
    }

    disable() {
        VRState.getInstance().leftController.onTriggerStateChangedObservable.remove(this.axisState.lObservable);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.axisState.rObservable);
        SceneState.getInstance().beforeRender.delete("selectionMode");
        this.box.setEnabled(false);
        this.box.isVisible = false;
    }

    beforeRender() {
        if (this.axisState.rightDecided && this.axisState.leftDecided) {
            this.boxDecided();
            return;
        }
        let vLR = this.axisState.lPosition.subtract(this.axisState.rPosition);
        let position = this.axisState.rPosition.add(vLR.scale(0.5));
        let height = Math.abs(vLR.y);
        let width = Math.abs(vLR.x);
        let depth = Math.abs(vLR.z);
        this.box.scaling.set(width, height, depth);
        this.box.position.copyFrom(position);
        this.box.setEnabled(true);
        this.box.isVisible = true;
    }
}