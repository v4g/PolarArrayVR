import { Mesh, MeshBuilder, DeepImmutable, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import { PolarArray } from "./polar-array";
import { VRState } from "./vr-state";
import { PolarArrayManager } from "./polar-array-manager";
import { SceneState } from ".";
import { Tool } from "./tool";

export class HeightModifier implements Tool {
    private heightModifier: Mesh;

    private HEIGHT_MODIFIER_SIZE = 0.08;
    private readonly MESH_COLOR = new Color3(0.4, 0.4, 0.4);
    private readonly MESH_ALPHA = 0.5;
    private listener: any;
    private point = new Vector3();
    private axis = new Vector3();
    private isHeld = false;

    constructor() {
        this.heightModifier = MeshBuilder.CreateSphere("HeightModifier", { diameter: this.HEIGHT_MODIFIER_SIZE });
        let material = new StandardMaterial("heightMaterial", SceneState.getInstance().scene);
        material.diffuseColor = this.MESH_COLOR;
        material.alpha = this.MESH_ALPHA;
        this.heightModifier.material = material;
        
        this.disable();
        this.listener = this.rControllerCallback.bind(this);
    }

    disable() {
        this.heightModifier.isVisible = false;
        this.heightModifier.isPickable = false;
        this.heightModifier.setEnabled(false);
        this.isHeld = false;
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.listener);
        SceneState.getInstance().beforeRender.delete("heightmodifier");
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
        SceneState.getInstance().beforeRender.set("heightmodifier", this.preRenderCallback.bind(this));
    }
    preRenderCallback() {
        const controller = VRState.getInstance().rightController;
        if (this.isHeld) {
            const ray = controller.getForwardRay(5);
            let PC = ray.origin.subtract(this.point);
            let PCy = this.axis.scale(Vector3.Dot(this.axis, PC));
            let PCx = PC.subtract(PCy);
            let D = PCx.length();
            let xAxis = PCx.normalize().scale(-1);
            let dotProduct = (Vector3.Dot(ray.direction, xAxis));
            if (dotProduct != 0) {
                let d = D / dotProduct;
                let PYZ = ray.direction.scale(d).add(PC);
                let height = Vector3.Dot(PYZ, this.axis);
                let newPosition = this.point.add(this.axis.scale(height));
                this.heightModifier.position.copyFrom(newPosition);
                PolarArrayManager.getInstance().setHeight(height);
            }
        }
    }
    rControllerCallback(event: any) {
        if (!event.pressed) {
            this.isHeld = false;
            return;
        }
        const controller = VRState.getInstance().rightController;
        const intersection = controller.getForwardRay(5).intersectsMesh(this.heightModifier as DeepImmutable<Mesh>);
        if (intersection.hit || this.isHeld) {
            this.isHeld = true;
        }
    }

}