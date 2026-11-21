class PopUpTrigger extends pc.ScriptType {
    id: string;
    isInteracted: boolean;

    initialize(): void {
        this.entity.collision?.on('triggerenter', this.onTriggerEnter, this);
        this.entity.collision?.on('triggerleave', this.onTriggerLeave, this);

        // Bersihkan listener saat entity di-destroy
        this.on('destroy', () => {
            this.entity.collision?.off('triggerenter', this.onTriggerEnter, this);
            this.entity.collision?.off('triggerleave', this.onTriggerLeave, this);
        });
    }

    onTriggerEnter = (other: pc.Entity) => {
        console.log("Trigger start:", other.name);
        console.log(other.tags);
        if (other.tags.has("player") && !this.isInteracted) {
            this.app.fire("openPopUp", this.id);
            this.isInteracted = true;
        }
    };

    onTriggerLeave = (other: pc.Entity) => {
        console.log("Trigger end:", other.name);
        this.isInteracted = false;
        this.app.fire("closePopUp", this.id);
    };
}

pc.registerScript(PopUpTrigger, "PopUpTrigger");

PopUpTrigger.attributes.add("id", {
    type: 'string',
    default: "",
    description: "ID of the windows",
});