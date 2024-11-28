import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

const el = document.createElement("div");
document.body.appendChild(el);
const root = createRoot(el);
root.render(<App />);