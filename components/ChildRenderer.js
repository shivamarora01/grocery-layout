"use client";

import { useAuth } from "@/context/Auth";

const ChildRenderer = ({ children }) => {
    const {isSetupComplete} = useAuth();
    return isSetupComplete ? children : null;
}

export default ChildRenderer;