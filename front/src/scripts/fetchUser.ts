import { API_URL } from "astro:env/client";
import fetchSession from "./fetchSession";

export default async function fetchUser() {
    const session = await fetchSession();
    if (!session) return null;
    const response = await fetch(
        `${API_URL}/api/v1/users/${session.username}`,
        {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            credentials: "include",
        }
    );

    if (response.status !== 200) {
        console.error(response);
        return null;
    }

    return await response.json();
}
