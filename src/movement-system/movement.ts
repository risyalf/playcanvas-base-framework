interface IMovement {
    doMove(direction: pc.Vec3): void;
}

abstract class Movement implements IMovement {
    entity!: pc.Entity;

    constructor(targetEntity: pc.Entity) {
        this.entity = targetEntity;
    }

    abstract doMove(direction: pc.Vec3): void;
}
