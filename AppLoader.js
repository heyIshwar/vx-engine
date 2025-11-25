class AppLoader {
    constructor() {
        this.loaders = [];
    }

    register(loader) {
        this.loaders.push(loader);
    }

    async initialize() {
        for (const loader of this.loaders) {
            if (typeof loader === 'function') {
                await loader();
            } else if (typeof loader.initialize === 'function') {
                await loader.initialize();
            }
        }
    }
}

module.exports = AppLoader;
