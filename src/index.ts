import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3, Plane, Color3, Path3D } from "@babylonjs/core/Maths/math";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { PointLight } from "@babylonjs/core/Lights/pointLight";
import {AdvancedDynamicTexture, StackPanel, TextBlock, Control, ColorPicker, Button} from "@babylonjs/gui";
import { VRState } from "./vr-state";
import { PolarArrayManager } from "./polar-array-manager";

import "@babylonjs/core/Helpers/sceneHelpers";
import "@babylonjs/core/Loading/Plugins/babylonFileLoader";

// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import {MeshBuilder} from  "@babylonjs/core/Meshes/meshBuilder";
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
    
    private constructor() {

    }

    static getInstance(): SceneState {
        if (!SceneState.instance) {
            SceneState.instance = new SceneState();
        }
        return SceneState.instance;
    }
};

class MyScene{
    scene: Scene;
    myGround: Mesh;
    vrState: VRState;
    
    // floatingUI: AdvancedDynamicTexture;
    constructor(engine: Engine){
        this.scene = new Scene(engine);
        // Add lights to the scene
        var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);
        var light2 = new PointLight("light2", new Vector3(0, 1, -1), this.scene);
        // Add and manipulate meshes in the scene
        var sphere = MeshBuilder.CreateSphere("sphere", {diameter:2}, this.scene);
        
        this.myGround = MeshBuilder.CreateGround("myGround", { height: 15, width: 10, subdivisions: 4 }, this.scene);
        let standardMaterial = new StandardMaterial("ground_mat",this.scene);
        standardMaterial.diffuseColor = new Color3(0.5,0.5,0.5);
        this.myGround.material = standardMaterial;
        this.myGround.position = new Vector3(0, 0, 0);
        this.myGround.isPickable = false;
        
        var webVr = this.scene.createDefaultVRExperience();
        webVr.enableInteractions();
        
        this.vrState = VRState.getInstance();
        let sceneState = SceneState.getInstance();
        sceneState.scene = this.scene;
        this.scene.registerBeforeRender(()=>{
            this.beforeRender();            
        });
        webVr.webVRCamera.onControllersAttachedObservable.add(()=>{
            this.vrState.valid = true;
            if (webVr.webVRCamera.leftController != null){
                this.vrState.leftController = webVr.webVRCamera.leftController;
                webVr.webVRCamera.leftController.onMainButtonStateChangedObservable.add(()=>{
                });
            }
            if (webVr.webVRCamera.rightController != null)
            {
                this.vrState.rightController = webVr.webVRCamera.rightController;
                webVr.webVRCamera.rightController.onSecondaryButtonStateChangedObservable.add((event)=>{
            });            
            }
            let pam = PolarArrayManager.getInstance(); 
            pam.createPolarArray(sphere);
           
        });
    }

    beforeRender() {

    }
}
/******* End of the create scene function ******/    
// code to use the Class above
var createScene = function() { 
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