import {VRState} from './vr-state';
import { MeshBuilder, Mesh, Vector3} from '@babylonjs/core';
import {SceneState} from './index';
import {Helpers} from './helpers';
import { PolarArrayManager } from './polar-array-manager';
import * as GUI from '@babylonjs/gui';
import {Protractor} from './protractor';

/**
 * This class will be responsible for creating all the GUIs used in creating
 * polar arrays
 */
export class PolarArrayGUI {
    static readonly NONE = 0;
    static readonly AXIS_MODE = 1;

    private static instance: PolarArrayGUI;
    private mAxisCylinder: Mesh;
    private axisState = new AxisModeState();
<<<<<<< HEAD
    private protractor: Protractor;
=======
    private state = PolarArrayGUI.NONE;
>>>>>>> 9aceb43... Renders the polar array now. Fixed some bugs
    private constructor() {
        let diameter = 0.05;
        this.mAxisCylinder = MeshBuilder.CreateCylinder("axisCylinder", {height: 1, diameter});
        this.mAxisCylinder.setEnabled(false);
        this.mAxisCylinder.isVisible = false;
        this.protractor = new Protractor();
        this.protractor.disable();
        
    }
    static getInstance(): PolarArrayGUI {
        if (!PolarArrayGUI.instance) {
            PolarArrayGUI.instance = new PolarArrayGUI();
        }
        return PolarArrayGUI.instance;
    }

    // Here you can define the axis of the polar array
    enterAxisMode(){
        // Controller can be accessed through VRState
        this.axisState = new AxisModeState();
        this.state = PolarArrayGUI.AXIS_MODE;
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
        }
    }

    // Here you can define the rest of the parameters of the polar array, you'd have to render the protractor,
    // alongwith the number of copies input
    enterParamsMode() {
        // TODO: Render the protractor, assign listener functions for the controllers
        this.protractor.enable();
        this.protractor.setPosition(VRState.getInstance().leftController.devicePosition);
        
        // TODO: Render the number input panel, assign listener functions
        // var num1 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-01.jpg");
        // var num2 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-02.jpg");
        // var num3 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-03.jpg");
        // var num4 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-04.jpg");
        // var num5 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-05.jpg");
        // var num6 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-06.jpg");
        // var num7 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-07.jpg");
        // var num8 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-08.jpg");
        // var num9 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-09.jpg");
        // var num0 = GUI.Button.CreateImageOnlyButton("num1", "textures/num-10.jpg");
        // var but1 = GUI.Button.CreateSimpleButton("but1", "Clear");
        // var but2 = GUI.Button.CreateSimpleButton("but2", "Confirm");

        // let numArray = [num1, num2, num3, num4, num5, num6, num7, num8, num9, num0, but1, but2]
        // numArray.forEach(function (numArray) {
        //     numArray.width = "40px";
        //     numArray.height = "40px";
        //     numArray.cornerRadius = 2;
        //     numArray.color = "black";
        // })
        // but1.width = "100px";
        // but1.fontSize = "18px"
        // but2.width = "100px";
        // but2.fontSize ="18px";

        // let numPalette1 = new GUI.StackPanel();
        // numPalette1.isVertical = false;
        // numPalette1.width = "200px";
        // numPalette1.height = "40px";
        // numPalette1.addControl(num0);
        // numPalette1.addControl(num1);
        // numPalette1.addControl(num2);
        // numPalette1.addControl(num3);
        // numPalette1.addControl(num4);

        // let numPalette2 = new GUI.StackPanel();
        // numPalette2.isVertical = false;
        // numPalette2.width = "200px";
        // numPalette2.height = "40px";
        // numPalette2.addControl(num5);
        // numPalette2.addControl(num6);
        // numPalette2.addControl(num7);
        // numPalette2.addControl(num8);
        // numPalette2.addControl(num9);

        // let numBlock = new GUI.TextBlock();
        // numBlock.width = "200px";
        // numBlock.height = "40px";
        // numBlock.color = "black";
        // numBlock.fontSize = "18px";

        // let butPalette = new GUI.StackPanel();
        // butPalette.isVertical = false;
        // butPalette.width = "200px";
        // butPalette.height = "40px";
        // butPalette.addControl(but1);
        // butPalette.addControl(but2);

        // let numPanel = new GUI.StackPanel();
        // numPanel.width = "200px";
        // numPanel.background = "white";
        // numPanel.color = "black";
        // numPanel.addControl(numPalette1);
        // numPanel.addControl(numPalette2);
        // numPanel.addControl(numBlock);
        // numPanel.addControl(butPalette);

        // // let plane = MeshBuilder.CreatePlane("plane", { size: 1 }, scene);
        // // let advancedTextureNew = GUI.AdvancedDynamicTexture.CreateForMesh(plane)
        // // advancedTextureNew.addControl(numPanel);
        // // scene.onBeforeRenderObservable.add(() => {
        // //     if (vrHelper.webVRCamera.leftController) {
        // //         head.rotationQuaternion = vrHelper.webVRCamera.deviceRotationQuaternion.clone()
        // //         plane.position = VRState.getInstance().leftController.devicePosition
        // //         plane.position.y += 0.1
        // //         plane.rotationQuaternion = head.rotationQuaternion
        // //     }
        // // })

        // num1.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "1";
        // })
        // num2.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "2";
        // })
        // num3.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "3";
        // })
        // num4.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "4";
        // })
        // num5.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "5";
        // })
        // num6.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "6";
        // })
        // num7.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "7";
        // })
        // num8.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "8";
        // })
        // num9.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "9";
        // })
        // num0.onPointerClickObservable.add((data, state) => {
        //     numBlock.text += "0";
        // })
        // but1.onPointerClickObservable.add((data, state) => {
        //     numBlock.text = "";
        // })
        // but2.onPointerClickObservable.add((data, state) => {
        // })
        
        // TODO: Render the axis handle and assign listener functions
    }

    createNumberPanel() {

    }

    // These should notify the PolarArrayManager that point on the axis was selected
    axisModeButtonListenerL(event: any) {
        if (!event.pressed)
            return;
        this.axisState.leftDecided = true;
        this.axisState.lPosition = VRState.getInstance().leftController.devicePosition.clone();
        console.log("L Button was Pressed");
        if (this.axisState.rightDecided) {
            this.exitAxisMode();
        }
    }
    axisModeButtonListenerR(event: any) {
        if (!event.pressed)
            return;
        this.axisState.rightDecided = true;
        this.axisState.rPosition = VRState.getInstance().rightController.devicePosition.clone();
        
        if (this.axisState.leftDecided) {
            this.exitAxisMode();
        }
    }
    // This function is called before the render function
    // Use it to decide what to do for the axis mode
    // When in axis mode, get the two endpoints of the controller and render a line
    axisModeBeforeRender() {
        this.renderAxisCylinder();
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