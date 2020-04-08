import {VRState} from './vr-state';
import { MeshBuilder, Mesh, Vector3} from '@babylonjs/core';
import {SceneState} from './index';
import {Helpers} from './helpers';
import { PolarArrayManager } from './polar-array-manager';

/**
 * This class will be responsible for creating all the GUIs used in creating
 * polar arrays
 */
export class PolarArrayGUI {
    private static instance: PolarArrayGUI;
    private mAxisCylinder: Mesh;
    private axisState = new AxisModeState();
    private constructor() {
        let diameter = 0.05;
        this.mAxisCylinder = MeshBuilder.CreateCylinder("axisCylinder", {height: 1, diameter});
        this.mAxisCylinder.setEnabled(false);
        this.mAxisCylinder.isVisible = false;
        
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
        SceneState.getInstance().scene.addMesh(this.mAxisCylinder);
        SceneState.getInstance().beforeRender.set("gui", this.axisModeBeforeRender.bind(this));
        
        // This is the position selected by the user where they want the endpoints to be
        // It is device position right now because the user hasn't fixed it
        this.axisState.lPosition = VRState.getInstance().leftController.devicePosition;
        this.axisState.rPosition = VRState.getInstance().rightController.devicePosition;
        
        // Set listener functions for the controller buttons to know when it has ended
        this.axisState.lObservable = this.axisModeButtonListenerL.bind(this);
        this.axisState.rObservable = this.axisModeButtonListenerR.bind(this);
        VRState.getInstance().leftController.onSecondaryButtonStateChangedObservable.add(this.axisState.lObservable);
        VRState.getInstance().rightController.onSecondaryButtonStateChangedObservable.add(this.axisState.rObservable);
    }

    exitAxisMode() {
        PolarArrayManager.getInstance().setAxis(this.axisState.rPosition.subtract(this.axisState.lPosition));
    }

    // Here you can define the rest of the parameters of the polar array, you'd have to render the protractor,
    // alongwith the number of copies input
    enterParamsMode() {
        // TODO: Render the protractor, assign listener functions for the controllers
        // TODO: Render the number input panel, assign listener functions
        // TODO: Render the axis handle and assign listener functions
    }

    // These should notify the PolarArrayManager that point on the axis was selected
    axisModeButtonListenerL() {
        this.axisState.leftDecided = true;
        if (this.axisState.rightDecided) {
            this.exitAxisMode();
        }
    }
    axisModeButtonListenerR() {
        this.axisState.rightDecided = true;
        if (this.axisState.rightDecided) {
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