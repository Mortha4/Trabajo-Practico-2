import { API_URL } from "astro:env/client";
import { session } from "./fetchSession";

const response = await fetch(`${API_URL}/api/v1/users/${session.username}`, {
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    credentials: "include",
});

if (response.status !== 200) console.error(response);
export const user = await response.json();
