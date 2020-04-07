import {VRState} from './vr-state';
import { MeshBuilder, Mesh } from '@babylonjs/core';

/**
 * This class will be responsible for creating all the GUIs used in creating
 * polar arrays
 */
export class PolarArrayGUI {
    private static instance: PolarArrayGUI;
    private mAxisCylinder: Mesh;
    private constructor() {
        let diameter = 1.0;
        this.mAxisCylinder = MeshBuilder.CreateCylinder("axisCylinder", {height: 1, diameter});
        this.mAxisCylinder.setEnabled(false);
        this.mAxisCylinder.isVisible = false;
        
    }
    getInstance(): PolarArrayGUI {
        if (!PolarArrayGUI.instance) {
            PolarArrayGUI.instance = new PolarArrayGUI();
        }
        return PolarArrayGUI.instance;
    }

    // Here you can define the axis of the polar array
    enterAxisMode(){
        // TODO: Monitor the controller movement and render a cylinder between them
        // TODO: Also set listener functions for the controller buttons to know when it has ended
        // Controller can be accessed through VRState
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

    }
    axisModeButtonListenerR() {

    }
    // This function is called before the render function
    // Use it to decide what to do for the axis mode
    // When in axis mode, get the two endpoints of the controller and render a line
    axisModeBeforeRender() {
    }

    renderAxisCylinder() {
        let vrState = VRState.getInstance();
        let vLR = vrState.leftController.devicePosition.subtract(vrState.rightController.devicePosition);
        let position = vrState.rightController.devicePosition.add(vLR.scale(0.5));
        let height = vLR.length();
        this.mAxisCylinder.scaling.y = height;
        this.mAxisCylinder.position.copyFrom(position);
        this.mAxisCylinder.setEnabled(true);
        this.mAxisCylinder.isVisible = true;
    }

}