"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
process.on("message", (data) => {
    if (data.karmaConfig) {
        const pathToKarma = path.join(data.karmaConfig.projectDir, 'node_modules/karma'), KarmaServer = require(path.join(pathToKarma, 'lib/server')), karma = new KarmaServer(data.karmaConfig, (exitCode) => {
            process.exit(exitCode);
        });
        karma.start();
    }
});
