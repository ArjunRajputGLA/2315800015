export type StackType = "backend" | "frontend";
export type LevelType = "debug" | "info" | "warn" | "error" | "fatal";
export type FrontendPackageType = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";
export type BackendPackageType = "cache" | "controller" | "cron_job" | "db" | "domain" | "handler" | "repository" | "route" | "service" | "auth" | "config" | "middleware" | "utils";
export type PackageType = FrontendPackageType | BackendPackageType;

let authToken: string | null = null;

export const setLogAuthToken = (token: string) => {
    authToken = token;
};

export const Log = async (
    stack: StackType,
    level: LevelType,
    pkg: PackageType,
    message: string
) => {
    const API_URL = "http://4.224.186.213/evaluation-service/logs";
    
    // Try to get token from variable, or from localStorage if in browser environment
    let token = authToken;
    if (!token && typeof window !== "undefined" && window.localStorage) {
        token = window.localStorage.getItem("access_token");
    }

    if (!token) {
        console.warn("LoggingMiddleware: No auth token available. Log discarded.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                stack,
                level,
                package: pkg,
                message
            })
        });

        if (!response.ok) {
            console.error("LoggingMiddleware: Failed to send log", response.statusText);
        }
    } catch (error) {
        console.error("LoggingMiddleware: Error sending log", error);
    }
};
