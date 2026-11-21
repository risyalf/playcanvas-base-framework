interface IPopUpManager {
    open(id: string): void;
    close(id: string): void;
}

class PopUpManager extends pc.ScriptType implements IPopUpManager {
    popUpScreens: pc.Entity[];

    open(id: string): void {
        this.popUpScreens.forEach(window => {
            if (window.name == id) {
                window.enabled = true;

                return;
            }

            window.enabled = false;
        });
    }
    close(id: string): void {
        this.popUpScreens.forEach(window => {
            if (window.name == id) {
                window.enabled = false;

                return;
            }
        });
    }

    initialize(): void {
        this.app.on("openPopUp", this.open, this);
        this.app.on("closePopUp", this.close, this);

        this.popUpScreens.forEach(window => {
            window.enabled = false;
        });
    }

    destroy() {
        this.app.off("openPopUp", this.open, this);
        this.app.off("closePopUp", this.close, this);
    }
}

pc.registerScript(PopUpManager, "PopUpManager");

PopUpManager.attributes.add("popUpScreens", {
    type: "entity",
    array: true,
    description: "All Windows Interactable"
})