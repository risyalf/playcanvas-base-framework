class Coba extends pc.ScriptType {
    targetEntity: pc.Entity;

    update() {
        // console.log(this.targetEntity.getPosition().distance(this.entity.getPosition()));
        this.entity.lookAt(this.targetEntity.getPosition());
    }
}

pc.registerScript(Coba, 'coba');

Coba.attributes.add('targetEntity', {
    type: 'entity',
    title: 'Target Entity',
    description: 'The entity to calculate distance to'
});