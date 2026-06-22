"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const autoSeed_1 = require("./utils/autoSeed");
const PORT = process.env.PORT || 5000;
async function startServer() {
    await (0, autoSeed_1.autoSeedDatabase)();
    app_1.default.listen(PORT, () => {
        console.log(`CloudForge Academy API server running on port ${PORT}`);
    });
}
startServer();
