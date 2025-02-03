import { API_URL } from "astro:env/client";

const response = await fetch(`${API_URL}/api/v1/session`, {
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    credentials: "include",
});
if (response.status !== 200) window.location.replace(`/login`);
export const session = await response.json();
