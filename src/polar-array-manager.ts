import {Mesh} from "@babylonjs/core";

/**
 * This class will be resposible for ultimately creating all
 * polar array objects and rendering them on the scene
 * No polar arrays should be created directly
 */

export class PolarArrayManager {
    private static instance: PolarArrayManager;
    
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
        // initialize GUI for Axis
        
    }

    // Set an axis for the polar array, this should render the polar array
    setAxis() {

    }
}