import {Mesh, MeshBuilder, Vector3} from "@babylonjs/core";
import {Helpers} from "./helpers";
/**
 * This is a Mesh that looks like a protractor and will allow the user to select an angle
 */
export class Protractor {
    private readonly HEIGHT = 0.1;
    private readonly DIAMETER = 0.5;
    private readonly ZERO_VEC = new Vector3(0, 0, 1);
    
    private _angle:number;
    private mesh: Mesh;
    
    constructor() {
        this.mesh = MeshBuilder.CreateCylinder("protractor", {height: this.HEIGHT, diameter: this.DIAMETER});
    }

    set angle(radians: number) {
        this._angle = radians;
    }

    get angle(): number {
        return this._angle;
    }

    setPosition(vec: Vector3) {
        this.mesh.position.copyFrom(vec);
    }

    /**
     * Sets the angle of the protractor to the one given by the vector in world coordinates
     * @param vec point on the mesh in world co-ordinates
     */
    setAngleFromPoint(vec: Vector3) {
        let arrow_world = vec.subtract(this.mesh.position);
        let arrow_local = Vector3.TransformCoordinates(vec,this.mesh.getWorldMatrix());
        let angle = Vector3.GetAngleBetweenVectors(this.ZERO_VEC, arrow_local, Helpers.UP);
        this.angle = angle;
        console.log("the angle is", angle);
    }
}