import { Mesh, MeshBuilder, Vector3, DeepImmutable, AbstractMesh, Matrix, Quaternion, Material, StandardMaterial, Color4, Color3, Plane, VertexBuffer, FloatArray } from "@babylonjs/core";
import { Helpers } from "./helpers";
import { VRState } from "./vr-state";
import { SceneState } from ".";
import { Tool } from "./tool";
import { PolarArrayManager } from "./polar-array-manager";
/**
 * This is a Mesh that looks like a protractor and will allow the user to select an angle
 */
export class Protractor implements Tool {
    private readonly HEIGHT = 0.01;
    private readonly DIAMETER = 0.1;
    private readonly TICK_LENGTH = 0.1;
    private readonly BIG_TICK_LENGTH = 0.2;
    private readonly SMALL_TICK_LENGTH = 0.06;
    private readonly ZERO_VEC = new Vector3(0, 0, 1);
    private readonly ZERO_TICK_POSITION = this.ZERO_VEC.clone().scaleInPlace(0.9).addInPlace(new Vector3(0, 0.6, 0));
    private readonly POINTER_POSITION = 1.1;
    private readonly POINTER_SCALE = 0.2;
    private readonly UP = new Vector3(0, 1, 0);

    private readonly PROTRACTOR_COLOR = new Color3(0, 0, 0.5);
    private readonly COVERING_COLOR = new Color3(0, 0, 0.3);
    private readonly TICK_COLOR = new Color3(0, 0, 0);
    private callback: any;

    private _angle = 0;
    private mesh!: Mesh;
    private cylinder!: Mesh;
    private pointer!: Mesh;
    private isHeld = false;
    private coveringMesh!: Mesh;
    private coveringMaterial!: StandardMaterial;

    constructor() {
        this.createProtractorMesh();
        this.callback = this.inputListener.bind(this);
    }

    set angle(radians: number) {
        if (radians < 0)
            radians = 2 * Math.PI + radians;
        if (this._angle > 3 * Math.PI / 2 && radians < Math.PI / 2) {
            radians = 2 * Math.PI;
        }
        if (this._angle < Math.PI / 4 && radians > Math.PI / 2) {
            radians = 0;
        }
        this._angle = radians;
        this.setPointer();
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
        let arrow_local = Vector3.TransformCoordinates(vec, matrix);
        console.log("Local vector", arrow_local);
        let angle = Vector3.GetAngleBetweenVectors(this.ZERO_VEC, arrow_local, Helpers.UP);
        this.angle = angle;
        console.log("the angle is", angle);
    }

    enable() {
        console.log("Protractor was Enabled");
        console.trace();
        this.mesh.isPickable = true;
        this.mesh.isVisible = true;
        this.mesh.setEnabled(true);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.add(this.callback);
        SceneState.getInstance().beforeRender.set("Protractor", this.beforeRender.bind(this));
    }
    disable() {
        this.mesh.isPickable = false;
        this.mesh.isVisible = false;
        this.mesh.setEnabled(false);
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.callback);
        SceneState.getInstance().beforeRender.delete("Protractor");
        this.isHeld = false;
    }

    beforeRender() {
        const controller = VRState.getInstance().leftController;
        let newPosition = controller.devicePosition.clone();
        newPosition.subtractInPlace(controller.getForwardRay(1).direction.scale(0.01));
        let up = new Vector3(0, 1, 0);
        if (controller.mesh?.getWorldMatrix())
            up = Vector3.TransformNormal(new Vector3(0, 1, 0), controller.mesh?.getWorldMatrix());
        newPosition.addInPlace(up.scale(0.2));
        this.mesh.position = newPosition;
        Helpers.lookAtCamera(VRState.getInstance().camera, this.mesh);

        if (this.isHeld) {
            let normal = new Vector3(0, 1, 0);
            if (this.mesh.rotationQuaternion)
                this.UP.rotateByQuaternionToRef(this.mesh.rotationQuaternion, normal);
            let d = Vector3.Dot(this.mesh.position, normal);
            console.log(normal, d);
            let plane = new Plane(normal.x, normal.y, normal.z, -d);
            const ray = VRState.getInstance().rightController.getForwardRay(10);
            let distance = ray.intersectsPlane(plane);
            if (distance) {
                let intersectionPoint = ray.origin.add(ray.direction.scale(distance));
                console.log(distance);
                this.setAngleFromPoint(intersectionPoint);
                PolarArrayManager.getInstance().setAngle(this.angle);
            }
        }
    }

    /**
     * This method will listen to any input events from the VR controller
     * It should set the angle corresponding to the point clicked on the mesh
     * @param event 
     */
    inputListener(event: any) {
        const mesh = this.mesh;
        if (!event.pressed) {
            this.isHeld = false;
            return;
        }
        const intersection = VRState.getInstance().rightController.getForwardRay(5).intersectsMesh(this.pointer as DeepImmutable<AbstractMesh>);
        if (intersection.hit) {
            console.log("Protractor was hit");
            this.isHeld = true;
        } else {
            console.log("Protractor was not hit");
        }
    }

    setPointer() {
        let newPosition = new Vector3();
        this.ZERO_VEC.rotateByQuaternionToRef(Quaternion.RotationAxis(this.UP, this.angle), newPosition);
        newPosition.scaleInPlace(this.POINTER_POSITION);
        this.pointer.position = newPosition;
        if (this.coveringMesh) {
            this.mesh.removeChild(this.coveringMesh);
            this.coveringMesh.dispose();
        }
        this.coveringMesh = MeshBuilder.CreateCylinder("coveringCylinder", { updatable: true, height: 1, diameter: 2, tessellation: 64, arc: this.angle / (Math.PI * 2) });
        this.mesh.addChild(this.coveringMesh);
        this.coveringMesh.position.set(0, 0, 0);
        this.coveringMesh.scaling.set(1, 1, 1);
        this.coveringMesh.rotation.set(0, 0 ,0);
        this.coveringMesh.rotate(this.UP, Vector3.GetAngleBetweenVectors(this.ZERO_VEC, new Vector3(-1, 0, 0), this.UP));
        this.coveringMesh.material = this.coveringMaterial;
    }

    createProtractorMesh() {
        this.mesh = new Mesh("Protractor");
        this.cylinder = MeshBuilder.CreateCylinder("protractorCylinder", { height: 0.9, diameter: 2, tessellation: 64 });
        this.pointer = MeshBuilder.CreateSphere("protractorPointer", { diameter: 1 });
        this.pointer.scaling.set(this.POINTER_SCALE, this.POINTER_SCALE, this.POINTER_SCALE);

        this.coveringMaterial = new StandardMaterial("coveringMaterial", SceneState.getInstance().scene);
        this.coveringMaterial.diffuseColor = this.COVERING_COLOR;
        this.coveringMaterial.alpha = 0.2;

        this.setPointer();

        this.coveringMesh.material = this.coveringMaterial;

        let N_TICKS = 180;
        let linePoints: Vector3[] = [new Vector3(0, 0, -0.5), new Vector3(0, 0, 0.5)];
        let tick = MeshBuilder.CreateLines("protractorTickLine", { points: linePoints });

        let protractor_material = new StandardMaterial("protractorMaterial", SceneState.getInstance().scene);
        protractor_material.diffuseColor = this.PROTRACTOR_COLOR;
        protractor_material.alpha = 0.1;
        this.cylinder.material = protractor_material;


        let ticks = new Mesh("protactorTicks");

        for (let i = 0; i < N_TICKS; i++) {
            let newTick = tick.clone("protractorTick" + i);
            newTick.color = this.TICK_COLOR
            if (i % 10 == 0) {
                newTick.scaling.set(1, 1, this.BIG_TICK_LENGTH);
            } else if (i % 5 == 0)
                newTick.scaling.set(1, 1, this.TICK_LENGTH);
            else
                newTick.scaling.set(1, 1, this.SMALL_TICK_LENGTH);

            let rotation = Quaternion.RotationAxis(new Vector3(0, 1, 0), i * Math.PI * 2 / N_TICKS);
            newTick.rotate(new Vector3(0, 1, 0), i * Math.PI * 2 / N_TICKS);

            let newPosition = this.ZERO_TICK_POSITION.clone();
            newPosition.rotateByQuaternionToRef(rotation, newPosition);
            newTick.position.copyFrom(newPosition);

            newTick.isPickable = false;
            ticks.addChild(newTick);
        }
        this.mesh.addChild(this.cylinder);
        this.mesh.addChild(ticks);
        this.mesh.addChild(this.pointer);
        this.mesh.scaling.set(this.DIAMETER, this.HEIGHT, this.DIAMETER);

        SceneState.getInstance().scene.addMesh(this.mesh);
    }
}