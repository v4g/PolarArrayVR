import { Mesh, Vector3 } from "@babylonjs/core";
import { PolarArrayGUI, AxisModeState } from './polar-array-gui';
import { PolarArray } from './polar-array';
import { PolarArrayRender } from './polar-array-render';

/**
 * This class will be resposible for ultimately creating all
 * polar array objects and rendering them on the scene
 * No polar arrays should be created directly
 */

export class PolarArrayManager {
    private static instance: PolarArrayManager;
    private currentPolarArray!: PolarArray;
    private constructor() {

    }
    static getInstance(): PolarArrayManager {
        if (!PolarArrayManager.instance) {
            PolarArrayManager.instance = new PolarArrayManager();
        }
        return PolarArrayManager.instance;
    }

    // This function will create a new polar array by initializing the GUI
    // It will run through the whole workflow
    // (Ideally there should be a GUI manager) but this will command the GUI
    // The GUI will send messages back to the manager
    // The manager will be in different states depending on where in the execution it is
    createPolarArray(mesh: Mesh) {
        this.currentPolarArray = new PolarArray(mesh);
        // initialize GUI for Axis
        this.currentPolarArray = new PolarArray(mesh);
        PolarArrayGUI.getInstance().enterAxisMode();

    }

    // Set an axis for the polar array, this should render the polar array
    setAxis(axisState: AxisModeState) {
        if (this.currentPolarArray) {
            this.currentPolarArray.calculatePointAndAxisOfRotation(axisState.lPosition, axisState.rPosition);
            // TODO: Store this rendering and polar array somewhere
            let render = new PolarArrayRender(this.currentPolarArray);

        }
<<<<<<< HEAD
        // TODO: Store this rendering and polar array somewhere
        let render = new PolarArrayRender(this.currentPolarArray);
        PolarArrayGUI.getInstance().enterParamsMode();
=======
>>>>>>> 9aceb43... Renders the polar array now. Fixed some bugs
    }
}