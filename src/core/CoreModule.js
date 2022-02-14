class CoreModule {
    constructor(name) {
        this.module_name = name;

        this.module_unload = null;
    }

    onUnload(callback) { this.module_unload = callback }
}

module.exports = CoreModule;