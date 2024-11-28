import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
const el = document.createElement("div");
document.body.appendChild(el);
const root = createRoot(el);
root.render(/*#__PURE__*/ _jsx(App, {}));
