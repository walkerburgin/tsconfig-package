import React from "react";
import { Foo } from "@monorepo/foo-lib";

export const App: React.FC = () => (
    <div>
        <div>App</div>
        <Foo />
    </div>
);