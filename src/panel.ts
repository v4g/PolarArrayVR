import {Mesh, Color3, MeshBuilder, StandardMaterial, Texture, DeepImmutable, AbstractMesh, Tools, Vector3, SphereBuilder, WebVRFreeCamera} from "@babylonjs/core";
import {SceneState} from './index';
import { VRState } from "./vr-state";
import { Tool } from "./tool";
import { PolarArray } from "./polar-array";
import { Helpers } from "./helpers";
export class MainPanel {
    private mesh!: Mesh;
    private readonly CHILD_PANEL_SIZE = 0.125;
    private panels: Panel[] = [];
    private _polar!: PolarArray;
    private clickObservable: any;
    private sphere: Mesh;
    private readonly UP = new Vector3(0, 0, -1);
    constructor(){
        this.mesh = new Mesh("MainPanel");
        this.clickObservable = this.onPointerClick.bind(this);
        this.sphere = MeshBuilder.CreateSphere("camresphere", {diameter : 0.01});
    }
    set polar(polarArray: PolarArray) {
        this._polar = polarArray;
    }   
    addPanel(tool: Tool, textureLocation?: string): Panel {
        let newPanel = new Panel(this.panels.length, this.CHILD_PANEL_SIZE, this.CHILD_PANEL_SIZE, tool);
        if (textureLocation) {
            newPanel.setTexture(textureLocation);
        }
        this.panels.push(newPanel);
        this.mesh.addChild(newPanel.mesh);
        this.respositionPanels();
        return newPanel;
    }

    respositionPanels() {
        let totalRows = Math.floor((this.panels.length + 1) / 2);
        console.log("Totla rows", totalRows);
        let totalCols = this.panels.length > 1 ? 2 : 1;
        console.log("Total cols", totalCols);
        let totalHeight = totalRows * this.CHILD_PANEL_SIZE;
        let totalWidth = totalCols * this.CHILD_PANEL_SIZE;
        for (let i = 0 ; i < this.panels.length; i++) {
            let row = Math.floor(i / 2);
            let col = i % 2;
            let fractionRow = row - (totalRows/2) + 0.5;
            let fractionCol = col - (totalCols/2) + 0.5;
            let x = fractionRow * this.CHILD_PANEL_SIZE;
            let y = fractionCol * this.CHILD_PANEL_SIZE;
            this.panels[i].mesh.position.set(y, x, 0);
        }
    }
    disable() {
        this.mesh.isPickable = false;
        this.mesh.isVisible = false;
        this.mesh.setEnabled(false);
        this.removeClick();
        SceneState.getInstance().beforeRender.delete("panel");
    }
    enable() {
        this.mesh.isPickable = true;
        this.mesh.isVisible = true;
        this.mesh.setEnabled(true);
        this.attachClick();
        SceneState.getInstance().beforeRender.set("panel", this.beforeRender.bind(this));
    }
    setPosition(vec: Vector3) {
        this.mesh.position.copyFrom(vec);
    }
    attachClick() {
        VRState.getInstance().rightController.onTriggerStateChangedObservable.add(this.clickObservable);
    }
    removeClick() {
        VRState.getInstance().rightController.onTriggerStateChangedObservable.remove(this.clickObservable);
        
    }
    onPointerClick(data: any) {
        if (!data.pressed) {
            return;
        }
        const ray = VRState.getInstance().rightController.getForwardRay(10);
        for (let i = 0 ; i < this.panels.length; i++){
            if (ray.intersectsMesh((this.panels[i].mesh as any) as DeepImmutable<AbstractMesh>)) {
                console.log("Main Panel was clicked");
                this.panels[i].open(this._polar);
            }
        }
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
        Helpers.lookAtCamera(VRState.getInstance().camera, this.mesh, this.UP);
        this.sphere.position.copyFrom(Vector3.FromArray((VRState.getInstance().camera as WebVRFreeCamera).rawPose?.position as Float32Array));
    }

}

/**
 * Each panel contains a mesh, a texture, a link to a tool
 */
export class Panel {
    private readonly MESH_COLOR = new Color3(0, 0, 0.5);
    mesh : Mesh;
    private panelMaterial: StandardMaterial; 
    private texture!: Texture;
    private tool!: Tool;
    constructor(i: number, height: number, width: number, tool: Tool) {
        this.mesh = MeshBuilder.CreatePlane("panel"+i, {sideOrientation: Mesh.DOUBLESIDE, height, width } );
        this.panelMaterial = new StandardMaterial("panelMaterial"+i, SceneState.getInstance().scene);
        this.panelMaterial.diffuseColor = this.MESH_COLOR;
        this.tool = tool;
    }
    setTexture(location: string) {
        this.texture =  new Texture("./src/texture1.jpg", SceneState.getInstance().scene);
        this.panelMaterial.diffuseTexture = this.texture;        
    }    
    open(data?:PolarArray) {
        this.tool.enable(data);
    }
    close() {
        this.tool.disable();
    }
}