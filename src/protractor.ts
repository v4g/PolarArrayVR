import {Mesh, MeshBuilder, Vector3, DeepImmutable, AbstractMesh, Matrix, Quaternion, Material, StandardMaterial} from "@babylonjs/core";
import {Helpers} from "./helpers";
import { VRState } from "./vr-state";
import { SceneState } from ".";
import { PolarArrayManager } from "./polar-array-manager";
/**
 * This is a Mesh that looks like a protractor and will allow the user to select an angle
 */
export class Protractor {
    private readonly HEIGHT = 0.01;
    private readonly DIAMETER = 0.1;
    private readonly TICK_LENGTH = 0.1 * this.DIAMETER;
    private readonly BIG_TICK_LENGTH = 0.2 * this.DIAMETER;
    private readonly ZERO_VEC = new Vector3(0, 0, 1);
    private readonly ZERO_TICK_POSITION = this.ZERO_VEC.clone().scaleInPlace(0.9);

    private callback: any;
    
    private _angle = 0;
    private mesh!: Mesh;
    
    constructor() {
        this.createProtractorMesh();
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
        console.log("Input Vector", vec);
        let matrix = new Matrix();
        this.mesh.getWorldMatrix().invertToRef(matrix);
        let arrow_local = Vector3.TransformCoordinates(vec,matrix);
        console.log("Local vector", arrow_local);
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
            PolarArrayManager.getInstance().setAngle(this.angle);
        } else {
            console.log("Protractor was not hit");
        }
    }

    createProtractorMesh() {
        this.mesh = new Mesh("Protractor");
        let cylinder = MeshBuilder.CreateCylinder("protractorCylinder", {height: 1, diameter: 2});
        
        let N_TICKS = 180;
        let linePoints: Vector3[] = [new Vector3(0, 0, -0.5), new Vector3(0, 0, 0.5)];
        let tick = MeshBuilder.CreateLines("protractorTickLine", {points: linePoints});
        let tick_material = new StandardMaterial("tickMaterial", SceneState.getInstance().scene);
        tick_material.diffuseColor.set(1, 1, 1) ;
        tick.material = tick_material;

        let ticks = new Mesh("protactorTicks");
 
        for (let i = 0 ; i < N_TICKS; i++) {
            let newTick = tick.clone("protractorTick"+i);
            newTick.scaling.set(1, 1, this.TICK_LENGTH);
            
            let rotation = Quaternion.RotationAxis(new Vector3(0, 1, 0), i * Math.PI * 2 / N_TICKS);
            newTick.rotate(new Vector3(0, 1, 0), i * Math.PI * 2 / N_TICKS);

            let newPosition = this.ZERO_TICK_POSITION.clone();
            newPosition.rotateByQuaternionToRef(rotation, newPosition);
            newTick.position.copyFrom(newPosition);

            newTick.isPickable = false;
            ticks.addChild(newTick);
        }
        this.mesh.addChild(cylinder);
        this.mesh.addChild(ticks);
        
        this.mesh.scaling.set(this.DIAMETER, this.HEIGHT, this.DIAMETER);
        SceneState.getInstance().scene.addMesh(this.mesh);              
    }
}