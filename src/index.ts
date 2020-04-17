import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Plane, Color3, Path3D } from "@babylonjs/core/Maths/math";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Control, ColorPicker, Button } from "@babylonjs/gui";
import { VRState } from "./vr-state";
import { PolarArrayManager } from "./polar-array-manager";
import * as GUI from '@babylonjs/gui';

import "@babylonjs/loaders/OBJ";
import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { TargetCamera } from "@babylonjs/core/Cameras/targetCamera";
import { KeyboardEventTypes } from "@babylonjs/core/Events/keyboardEvents";
import { Camera } from "@babylonjs/core/Cameras/camera";
import { FreeCamera } from "@babylonjs/core/Cameras/freeCamera";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import "@babylonjs/core/Gamepads";
import { WebVRFreeCamera } from "@babylonjs/core/Cameras/VR/webVRCamera";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { VertexBuffer } from "@babylonjs/core/Meshes/buffer";
import { SceneLoader } from "@babylonjs/core";
var canvas = document.getElementById("renderCanvas") as HTMLCanvasElement; // Get the canvas element 
var engine = new Engine(canvas, true); // Generate the BABYLON 3D engine


/******* Add the Playground Class with a static CreateScene function ******/
class Playground {
    public static CreateScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
        // Create the scene space
        var myscene = new MyScene(engine);
        return myscene.scene;
    }

}

export class SceneState {
    scene!: Scene;
    private static instance: SceneState;
    allMeshes: Mesh[] = []
    beforeRender: Map<string, { (): void }> = new Map<string, { (): void }>();
    private constructor() {

    }

    static getInstance(): SceneState {
        if (!SceneState.instance) {
            SceneState.instance = new SceneState();
        }
        return SceneState.instance;
    }

    callAllBeforeRenders() {
        let iter = this.beforeRender.values();
        let first = iter.next();
        while (!first.done) {
            first.value();
            first = iter.next();
        }
    }
};

class MyScene {
    scene: Scene;
    myGround: Mesh;
    vrState: VRState;
    clones: (Mesh | null)[] = []
    sphere: Mesh;
    // floatingUI: AdvancedDynamicTexture;
    constructor(engine: Engine) {
        this.scene = new Scene(engine);
        // Add lights to the scene
        var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        var light2 = new PointLight("light2", new Vector3(0, 1, -1), this.scene);
        // Add and manipulate meshes in the scene

        var sphere = MeshBuilder.CreateBox("sphere", { size: 0.02 }, this.scene);
        sphere.position.set(0.2, 1.5, 0.2);
        this.sphere = sphere;
        console.log("something");

        this.myGround = MeshBuilder.CreateGround("myGround", { height: 15, width: 10, subdivisions: 4 }, this.scene);

        let standardMaterial = new StandardMaterial("ground_mat", this.scene);
        standardMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
        standardMaterial.alpha = 0.2;
        this.myGround.material = standardMaterial;
        this.myGround.position = new Vector3(0, 0, 0);
        this.myGround.isPickable = false;

        var instructionsPlane = MeshBuilder.CreatePlane("instructionsPlane", { size: 4, sideOrientation: Mesh.DOUBLESIDE }, scene);
        let material = new StandardMaterial("InstructionsMaterial", scene);
        material.diffuseTexture = new Texture("./src/Instructions.png", SceneState.getInstance().scene);
        material.diffuseTexture.hasAlpha = true;
        instructionsPlane.material = material;
        instructionsPlane.position.set(0, 2, 5);
        instructionsPlane.isPickable = false;

        // let instruction = new GUI.TextBlock();
        // instruction.width = "800px";
        // instruction.height = "800px";
        // instruction.color = "black";
        // instruction.fontSize = "18px";
        // instruction.text = "20";
        // instruction.text = "0. Press and hold the secondary trigger to zoom"

        var webVr = this.scene.createDefaultVRExperience();
        webVr.enableInteractions();


        this.vrState = VRState.getInstance();
        let sceneState = SceneState.getInstance();
        sceneState.scene = this.scene;
        sceneState.allMeshes.push(sphere);
        this.scene.registerBeforeRender(() => {
            this.beforeRender();
        })

        // SceneLoader.ImportMesh("", "src/Chair/", "Chair.obj", scene, function (newMeshes) {
        //     newMeshes[0].position = new Vector3(0, 0, -1.8);
        //     newMeshes[0].scaling.set(0.025, 0.025, 0.025);
        //     newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        //     sceneState.allMeshes.push(newMeshes[0] as Mesh);
        //     console.log("Chair Imported");
        // });

        // SceneLoader.ImportMesh("", "src/models/", "round.obj", scene, function (newMeshes) {
        //     newMeshes[0].position = new Vector3(0, 0, -3);
        //     newMeshes[0].scaling.set(0.04, 0.04, 0.04);
        //     newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        // });
        SceneLoader.ImportMesh("", "src/models/", "turbine.obj", scene, function (newMeshes) {
            newMeshes[0].position = new Vector3(0, 1, -2);
            newMeshes[0].scaling.set(0.04, 0.04, 0.04);
            newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        });

        SceneLoader.ImportMesh("", "src/models/", "blade.obj", scene, function (newMeshes) {
            newMeshes[0].position = new Vector3(0, 1, -2);
            newMeshes[0].scaling.set(0.04, 0.04, 0.04);
            newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        });

        // SceneLoader.ImportMesh("", "src/test/", "test2.obj", scene, function (newMeshes) {
        //     newMeshes[0].position = new Vector3(0, 1, -2);
        //     newMeshes[0].scaling.set(0.04, 0.04, 0.04);
        //     newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        // });

        let mat = new StandardMaterial("material", scene);
        mat.diffuseColor = new Color3(1,1,0)

        // SceneLoader.ImportMesh("", "src/Chair/", "untitled.obj", scene, function (newMeshes) {
        //     newMeshes[0].position = new Vector3(0, 0.5, 1);
        //     newMeshes[0].scaling.set(0.1, 0.1, 0.1);
        //     newMeshes[0].rotation.set(-Math.PI/2, Math.PI, 0);
        //     newMeshes[0].material = mat;
        //     sceneState.allMeshes.push(newMeshes[0] as Mesh);
        //     console.log("Chair Imported");
        // });

        this.vrState.camera = webVr.webVRCamera;
        webVr.webVRCamera.onControllersAttachedObservable.add(() => {
            this.vrState.valid = true;
            if (webVr.webVRCamera.leftController != null) {
                this.vrState.leftController = webVr.webVRCamera.leftController;
                webVr.webVRCamera.leftController.onMainButtonStateChangedObservable.add(() => {
                });
            }
            if (webVr.webVRCamera.rightController != null) {
                this.vrState.rightController = webVr.webVRCamera.rightController;
                webVr.webVRCamera.rightController.onSecondaryButtonStateChangedObservable.add((event) => {
                });
            }
            let pam = PolarArrayManager.getInstance();
            pam.selectMeshes();

        });
    }

    beforeRender() {
        SceneState.getInstance().callAllBeforeRenders();
        // const positions = []
        // for (let i = 0; i < this.clones.length; i++) {
        //     if (this.clones[i] != null) {
        //         positions.push((this.clones[i] as Mesh).position.clone());
        //         this.scene.removeMesh(this.clones[i] as Mesh);
        //         (this.clones[i] as Mesh).dispose();
        //         this.clones[i] = null;
        //     }
        // }
        // this.clones = []
        // for (let i = 0; i < 50; i++) {
        //     var clone = this.sphere.clone();
        //     if (positions.length > i)
        //         clone.position = positions[i];
        //     else 
        //         clone.position.addInPlace(new Vector3(i * 0.1, 0, 0));
        //     this.scene.addMesh(clone);
        //     this.clones.push(clone);
        // }

        // for (let i = 0; i < this.clones.length; i++) {
        //     let deltaX = Math.random() * 0.002 - 0.001;
        //     let deltaY = Math.random() * 0.002 - 0.001;
        //     (this.clones[i] as Mesh).position.addInPlace(new Vector3(deltaX, deltaY, 0));
        // }
    }
}
/******* End of the create scene function ******/
// code to use the Class above
var createScene = function () {
    return Playground.CreateScene(engine,
        engine.getRenderingCanvas() as HTMLCanvasElement);
}

var scene = createScene(); //Call the createScene function

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(function () {
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", function () {
    engine.resize();
});