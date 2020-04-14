import {VRState} from './vr-state';
import { MeshBuilder, Mesh, Vector3, CubeMapToSphericalPolynomialTools, StandardMaterial, Color3, Texture, Scene} from '@babylonjs/core';
import {SceneState} from './index';
import {Helpers} from './helpers';
import { PolarArrayManager } from './polar-array-manager';
import * as GUI from '@babylonjs/gui';
import {Protractor} from './protractor';
import { PolarArray } from './polar-array';
import {HeightModifier} from './height-modifier';
import {MainPanel, Panel} from './panel';
import {BoxSelection} from './box-selection';
/**
 * This class will be responsible for creating all the GUIs used in creating
 * polar arrays
 */
export class PolarArrayGUI {
    static readonly NONE = 0;
    static readonly AXIS_MODE = 1;
    static readonly SELECTION_MODE = 2;
    private readonly AXIS_COLOR = new Color3(0.7, 0, 0);
    private readonly AXIS_OPACITY = 0.3;


    private static instance: PolarArrayGUI;
    private mAxisCylinder: Mesh;
    private axisState = new AxisModeState();
    private protractor: Protractor;
    private state = PolarArrayGUI.NONE;
    private heightModifier: HeightModifier;
    private boxSelector: BoxSelection;
    private confirmationText!: Mesh;
    private confirmationObserver: any;
    // private mainPanel: MainPanel;
    private constructor() {
        let diameter = 0.02;
        this.mAxisCylinder = MeshBuilder.CreateCylinder("axisCylinder", {height: 1, diameter});
        this.mAxisCylinder.setEnabled(false);
        this.mAxisCylinder.isVisible = false;
        let axisMaterial = new StandardMaterial("axisMaterial", SceneState.getInstance().scene);
        axisMaterial.diffuseColor = this.AXIS_COLOR;
        axisMaterial.alpha = this.AXIS_OPACITY;
        this.mAxisCylinder.material = axisMaterial;
        
        this.protractor = new Protractor();
        this.protractor.disable(); 
        this.heightModifier = new HeightModifier();
        this.boxSelector = new BoxSelection();
        this.createConfirmationText();
        this.confirmationObserver = this.confirmationListener.bind(this); 
        // this.mainPanel = new MainPanel();
        // this.createPanel();
    }
    static getInstance(): PolarArrayGUI {
        if (!PolarArrayGUI.instance) {
            PolarArrayGUI.instance = new PolarArrayGUI();
        }
        return PolarArrayGUI.instance;
    }
    /**
     * The panel will contain all the UI tools. It is readjustable so that you can pick it up and
     * move it in the plane. It will contain 3 rectangles, one for each parameter. Clicking on these
     * panels will open the corresponding UI. One rectangle to Exit
     */
    // private createPanel() {
    //     this.mainPanel.addPanel(this.protractor);
    //     this.mainPanel.addPanel(this.heightModifier);
    //     this.mainPanel.disable();
    // }

    createConfirmationText() {
        this.confirmationText = MeshBuilder.CreatePlane("confirmationTextPlane", {width: 0.5, height: 0.05, sideOrientation: Mesh.DOUBLESIDE});
        let material = new StandardMaterial("confirmationMaterial", SceneState.getInstance().scene);
        let onload = ()=>{
            console.log("loaded");
        };
        material.diffuseTexture = new Texture("./src/AToConfirm.png", SceneState.getInstance().scene, undefined, undefined, undefined, onload);
        material.diffuseTexture.hasAlpha = true;
        this.confirmationText.material = material;
        SceneState.getInstance().scene.addMesh(this.confirmationText);
        this.confirmationText.isPickable = false;
        this.disableConfirmation();
    }
    enableConfirmation() {
        this.confirmationText.isVisible = true;
        this.confirmationText.setEnabled(true);
    }

    disableConfirmation() {
        this.confirmationText.isVisible = false;
        this.confirmationText.setEnabled(false);
    }
    // Here you can define the axis of the polar array
    enterAxisMode(){
        // Controller can be accessed through VRState
        console.log("Entering Axis Mode");
        this.axisState = new AxisModeState();
        this.state = PolarArrayGUI.AXIS_MODE;
        VRState.getInstance().saveState();
        SceneState.getInstance().scene.addMesh(this.mAxisCylinder);
        SceneState.getInstance().beforeRender.set("gui", this.axisModeBeforeRender.bind(this));
        
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

    exitAxisMode() {
        if (this.state == PolarArrayGUI.AXIS_MODE) {
            console.log("Exiting Axis Mode");
            this.state = PolarArrayGUI.NONE;
            VRState.getInstance().leftController.onTriggerStateChangedObservable.remove(this.axisState.lObservable);
            VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.axisState.rObservable);
            PolarArrayManager.getInstance().setAxis(this.axisState);
            SceneState.getInstance().beforeRender.delete("gui");
            this.mAxisCylinder.setEnabled(false);
            this.mAxisCylinder.isVisible = false;
        
        }
    }

    enterSelectionMode() {
        console.log("Entering Selection Mode");
        this.state = PolarArrayGUI.SELECTION_MODE;
        this.boxSelector.enable();
        VRState.getInstance().saveState();
        this.boxSelector.callback = this.selectionConfirmed.bind(this);
    }

    selectionConfirmed(meshes: Mesh[]) {
        console.log("Selection Confirmed", meshes.length);
        if (meshes.length == 0) {
            this.exitSelectionMode();
            this.enterSelectionMode();
        }
        else {
            this.exitSelectionMode();
            PolarArrayManager.getInstance().createPolarArray(meshes);
        }
    }

    exitSelectionMode() {
        this.state = PolarArrayGUI.NONE;
        this.boxSelector.disable();        
    }

    // Here you can define the rest of the parameters of the polar array, you'd have to render the protractor,
    // alongwith the number of copies input
    enterParamsMode(polarArray: PolarArray) {
        // this.mainPanel.polar = polarArray;
        // this.mainPanel.enable();
        // this.mainPanel.setPosition(VRState.getInstance().leftController.devicePosition);
        // TODO: Render the protractor, assign listener functions for the controllers
        this.protractor.enable();
        this.protractor.setPosition(VRState.getInstance().leftController.devicePosition);
        
        // TODO: Render the number input panel, assign listener functions
        // this.createNumberPanel();
        
        // TODO: Render the axis handle and assign listener functions
        this.createHeightModifier(polarArray);
        this.enableConfirmation();
        SceneState.getInstance().beforeRender.set("params", this.paramsModeBeforeRender.bind(this));
        VRState.getInstance().rightController.onSecondaryButtonStateChangedObservable.add(this.confirmationObserver);
    }

    exitParamsMode() {
        // this.mainPanel.disable();
        this.protractor.disable();
        this.heightModifier.disable();
        this.disableConfirmation();
        SceneState.getInstance().beforeRender.delete("params");
        VRState.getInstance().rightController.onSecondaryButtonStateChangedObservable.remove(this.confirmationObserver);
    }
    createNumberPanel() {
        var num1 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-01.jpg");
        var num2 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-02.jpg");
        var num3 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-03.jpg");
        var num4 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-04.jpg");
        var num5 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-05.jpg");
        var num6 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-06.jpg");
        var num7 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-07.jpg");
        var num8 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-08.jpg");
        var num9 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-09.jpg");
        var num0 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-10.jpg");
        var but1 = GUI.Button.CreateSimpleButton("but1", "Clear");
        var but2 = GUI.Button.CreateSimpleButton("but2", "Confirm");

        let numArray = [num1, num2, num3, num4, num5, num6, num7, num8, num9, num0, but1, but2]
        numArray.forEach(function (numArray) {
            numArray.width = "40px";
            numArray.height = "40px";
            numArray.cornerRadius = 2;
            numArray.color = "black";
        })
        but1.width = "100px";
        but1.fontSize = "18px"
        but2.width = "100px";
        but2.fontSize ="18px";

        let numPalette1 = new GUI.StackPanel();
        numPalette1.isVertical = false;
        numPalette1.width = "200px";
        numPalette1.height = "40px";
        numPalette1.addControl(num0);
        numPalette1.addControl(num1);
        numPalette1.addControl(num2);
        numPalette1.addControl(num3);
        numPalette1.addControl(num4);

        let numPalette2 = new GUI.StackPanel();
        numPalette2.isVertical = false;
        numPalette2.width = "200px";
        numPalette2.height = "40px";
        numPalette2.addControl(num5);
        numPalette2.addControl(num6);
        numPalette2.addControl(num7);
        numPalette2.addControl(num8);
        numPalette2.addControl(num9);

        let numBlock = new GUI.TextBlock();
        numBlock.width = "200px";
        numBlock.height = "40px";
        numBlock.color = "black";
        numBlock.fontSize = "18px";

        let butPalette = new GUI.StackPanel();
        butPalette.isVertical = false;
        butPalette.width = "200px";
        butPalette.height = "40px";
        butPalette.addControl(but1);
        butPalette.addControl(but2);

        let numPanel = new GUI.StackPanel();
        numPanel.width = "200px";
        numPanel.background = "white";
        numPanel.color = "black";
        numPanel.addControl(numPalette1);
        numPanel.addControl(numPalette2);
        numPanel.addControl(numBlock);
        numPanel.addControl(butPalette);

        let plane = MeshBuilder.CreatePlane("plane", { size: 1 }, SceneState.getInstance().scene);
        let advancedTexture = GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        advancedTexture.addControl(numPanel);       
        SceneState.getInstance().scene.onBeforeRenderObservable.add(() => {  
            plane.position = VRState.getInstance().leftController.devicePosition.clone();
            plane.position.y += 0.1;
            plane.rotationQuaternion = VRState.getInstance().head.deviceRotationQuaternion.clone();                  
        })

        num1.onPointerClickObservable.add((data, state) => {
            numBlock.text += "1";
        })
        num2.onPointerClickObservable.add((data, state) => {
            numBlock.text += "2";
        })
        num3.onPointerClickObservable.add((data, state) => {
            numBlock.text += "3";
        })
        num4.onPointerClickObservable.add((data, state) => {
            numBlock.text += "4";
        })
        num5.onPointerClickObservable.add((data, state) => {
            numBlock.text += "5";
        })
        num6.onPointerClickObservable.add((data, state) => {
            numBlock.text += "6";
        })
        num7.onPointerClickObservable.add((data, state) => {
            numBlock.text += "7";
        })
        num8.onPointerClickObservable.add((data, state) => {
            numBlock.text += "8";
        })
        num9.onPointerClickObservable.add((data, state) => {
            numBlock.text += "9";
        })
        num0.onPointerClickObservable.add((data, state) => {
            numBlock.text += "0";
        })
        but1.onPointerClickObservable.add((data, state) => {
            numBlock.text = "";
        })
        but2.onPointerClickObservable.add((data, state) => {
        })
    }

    // These should notify the PolarArrayManager that point on the axis was selected
    axisModeButtonListenerL(event: any) {
        if (!event.pressed || !VRState.getInstance().eventValidL)
            return;
        this.axisState.leftDecided = true;
        this.axisState.lPosition = VRState.getInstance().leftController.devicePosition.clone();
        console.log("L Button was Pressed");
        
    }
    axisModeButtonListenerR(event: any) {
        if (!event.pressed || !VRState.getInstance().eventValidR)
            return;
        console.log("R Button Pressed");
        this.axisState.rightDecided = true;
        this.axisState.rPosition = VRState.getInstance().rightController.devicePosition.clone();       
        
    }
    // This function is called before the render function
    // Use it to decide what to do for the axis mode
    // When in axis mode, get the two endpoints of the controller and render a line
    axisModeBeforeRender() {
        this.renderAxisCylinder();
        if (this.axisState.rightDecided && this.axisState.leftDecided) {
            this.exitAxisMode();
        }
    }

    renderAxisCylinder() {
        let vrState = VRState.getInstance();
        let vLR = this.axisState.lPosition.subtract(this.axisState.rPosition);
        let position = this.axisState.rPosition.add(vLR.scale(0.5));
        let height = vLR.length();
        this.mAxisCylinder.scaling.y = height;
        this.mAxisCylinder.position.copyFrom(position);
        this.mAxisCylinder.setEnabled(true);
        this.mAxisCylinder.isVisible = true;
        this.mAxisCylinder.rotationQuaternion = Helpers.QuaternionFromUnitVectors(Helpers.UP, vLR);
    }

    createHeightModifier(polar: PolarArray) {
        this.heightModifier.enable(polar);
    }

    paramsModeBeforeRender() {
        const controller = VRState.getInstance().leftController;
        let newPosition = controller.devicePosition.clone();
        newPosition.subtractInPlace(controller.getForwardRay(1).direction.scale(0.01));
        let up = new Vector3(0, 1, 0);
        if (controller.mesh?.getWorldMatrix())
            up = Vector3.TransformNormal(new Vector3(0, 1, 0), controller.mesh?.getWorldMatrix());
        newPosition.addInPlace(up.scale(0.4));
        this.confirmationText.position = newPosition;
    }

    confirmationListener(event: any) {
        if(event.pressed) {
            console.log("Confirmed");
            this.exitParamsMode();
            PolarArrayManager.getInstance().finalizeArray();
            PolarArrayManager.getInstance().selectMeshes();
        }
    }
}

export class AxisModeState {
    leftDecided = false;
    rightDecided = false;
    lObservable: any;
    rObservable: any;
    lPosition = new Vector3();
    rPosition = new Vector3();
    constructor() {

    }
};