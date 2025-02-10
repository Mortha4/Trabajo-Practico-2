import { API_URL } from "astro:env/client";

export default async function fetchSession() {
    const response = await fetch(`${API_URL}/api/v1/session`, {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        credentials: "include",
    });
    if (response.status !== 200) return null;

    return await response.json();
}
