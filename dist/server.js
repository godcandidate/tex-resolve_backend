"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
require("dotenv/config");
const db_1 = __importDefault(require("./utils/db"));
//create server
const PORT = process.env.PORT || 4000;
app_1.app.listen(PORT, () => {
    console.log(`Server is connected http://localhost:${process.env.PORT}`);
    (0, db_1.default)();
});
