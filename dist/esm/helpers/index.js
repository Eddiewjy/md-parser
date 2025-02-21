"use strict";
// Just a shortcut for bulk export
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseLinkTitle = exports.parseLinkDestination = exports.parseLinkLabel = void 0;
const parse_link_label_js_1 = __importDefault(require("./parse_link_label.js"));
exports.parseLinkLabel = parse_link_label_js_1.default;
const parse_link_destination_js_1 = __importDefault(require("./parse_link_destination.js"));
exports.parseLinkDestination = parse_link_destination_js_1.default;
const parse_link_title_js_1 = __importDefault(require("./parse_link_title.js"));
exports.parseLinkTitle = parse_link_title_js_1.default;
