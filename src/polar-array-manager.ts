import { Mesh, Vector3 } from "@babylonjs/core";
import { PolarArrayGUI, AxisModeState } from './polar-array-gui';
import { PolarArray } from './polar-array';
import { PolarArrayRender } from './polar-array-render';
import { SceneState } from ".";

/**
 * This class will be resposible for ultimately creating all
 * polar array objects and rendering them on the scene
 * No polar arrays should be created directly
 */

export class PolarArrayManager {
    private static instance: PolarArrayManager;
    private currentPolarArray!: PolarArray;
    private render!: PolarArrayRender;
    private constructor() {

    }
    static getInstance(): PolarArrayManager {
        if (!PolarArrayManager.instance) {
            PolarArrayManager.instance = new PolarArrayManager();
        }
        return PolarArrayManager.instance;
    }

    selectMeshes() {
        PolarArrayGUI.getInstance().enterSelectionMode();
    }

    // This function will create a new polar array by initializing the GUI
    // It will run through the whole workflow
    // (Ideally there should be a GUI manager) but this will command the GUI
    // The GUI will send messages back to the manager
    // The manager will be in different states depending on where in the execution it is
    createPolarArray(meshes: Mesh[]) {
        this.currentPolarArray = new PolarArray(meshes);
        // initialize GUI for Axis
        // this.currentPolarArray = new PolarArray(meshes);
        PolarArrayGUI.getInstance().enterAxisMode();

    }

    // Set an axis for the polar array, this should render the polar array
    setAxis(axisState: AxisModeState) {
        if (this.currentPolarArray) {
            this.currentPolarArray.calculatePointAndAxisOfRotation(axisState.lPosition, axisState.rPosition);
            // TODO: Store this rendering and polar array somewhere
            this.render = new PolarArrayRender(this.currentPolarArray);

        }
        PolarArrayGUI.getInstance().enterParamsMode(this.currentPolarArray);
    }

    setAngle(angle: number) {
        if (this.currentPolarArray) {
            this.currentPolarArray.totalAngle = angle;
            // TODO: Store this rendering and polar array somewhere
            if (this.render) {
                this.render.updateRender(this.currentPolarArray);
            }
            else
                this.render = new PolarArrayRender(this.currentPolarArray);
        }
    }

    setHeight(height: number) {
        if (this.currentPolarArray) {
            this.currentPolarArray.height = height;
            // TODO: Store this rendering and polar array somewhere
            if (this.render) {
                this.render.updateRender(this.currentPolarArray);
            }
            else
                this.render = new PolarArrayRender(this.currentPolarArray);
        }
    }

    deltaHeight(height: number) {
        if (this.currentPolarArray) {
            this.currentPolarArray.height += height;
            // TODO: Store this rendering and polar array somewhere
            if (this.render) {
                this.render.updateRender(this.currentPolarArray);
            }
            else
                this.render = new PolarArrayRender(this.currentPolarArray);
        }
    }
    setCopies(copies: number) {
        if (this.currentPolarArray) {
            this.currentPolarArray.n_copies = copies;
            // TODO: Store this rendering and polar array somewhere
            if (this.render) {
                this.render.destroy();
            }
            this.render = new PolarArrayRender(this.currentPolarArray);
        }
    }

    finalizeArray() {
        const allMeshes = SceneState.getInstance().allMeshes;
        this.render.copies.forEach(copy => {
            allMeshes.push(copy);
        });
        this.render.finalize();
    }

    cancelArray() {
        this.render.destroy();
    }

    finalizeRibbon() {
        const allMeshes = SceneState.getInstance().allMeshes;
        this.render.renderRibbon();
        allMeshes.push(this.render.ribbon);
        this.render.finalize();
    }
}