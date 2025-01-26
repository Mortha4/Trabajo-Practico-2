import { describe, it } from "node:test";
import assert from "node:assert";
import { StatusCodes } from "http-status-codes";

const url = "http://localhost:3000/api/v1";

describe("POST /session", function () {
    it("should start a new session", async function () {
        const authRequest = await fetch(`${url}/session`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Basic ${Buffer.from("marxel:Breaking_Bad_TCG").toString("base64")}`,
            },
        });
        assert.equal(
            authRequest.status,
            StatusCodes.OK,
            "Couldnt authenticate"
        );
    });
});

describe("GET /session", async function () {
    const authRequest = await fetch(`${url}/session`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from("marxel:Breaking_Bad_TCG").toString("base64")}`,
        },
    });

    it("should retrieve session information", async function () {
        const res = await fetch(`${url}/session`, {
            headers: {
                Cookie: `${authRequest.headers.getSetCookie()}`,
            },
        });
        assert.equal(res.status, StatusCodes.OK, "Couldnt authenticate");
    });
});

describe("GET /users", async function () {
    const authRequest = await fetch(`${url}/session`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from("marxel:Breaking_Bad_TCG").toString("base64")}`,
        },
    });
    assert.equal(authRequest.status, StatusCodes.OK, "Couldnt authenticate");

    it("should reject unauthenticated users", async function () {
        const res = await fetch(`${url}/users`, { method: "GET" });
        assert.equal(
            res.status,
            StatusCodes.UNAUTHORIZED,
            "Got unexpected status code"
        );
    });
    it("should return a list of users when authenticated", async function () {
        const res = await fetch(`${url}/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Cookie: `${authRequest.headers.getSetCookie()}`,
            },
        });

        assert.equal(res.status, StatusCodes.OK, "Got unexpected status code");
    });
});

describe("GET /cards", function () {
    it("should return a list of cards", async function () {
        const res = await fetch(`${url}/cards`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        assert.equal(res.status, StatusCodes.OK, "Got unexpected status code");
    });
});

describe("GET /cardpacks", function () {
    it("should return a list of card packs", async function () {
        const res = await fetch(`${url}/cardpacks`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        assert.equal(res.status, StatusCodes.OK, "Got unexpected status code");
    });
});

describe("GET /users/marxel/cards", async function () {
    const authRequest = await fetch(`${url}/session`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from("marxel:Breaking_Bad_TCG").toString("base64")}`,
        },
    });
    it("should return a list of cards belonging to user marxel", async function () {
        const res = await fetch(`${url}/users/marxel/cards`, {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Cookie: `${authRequest.headers.getSetCookie()}`,
            },
        });

        assert.equal(res.status, StatusCodes.OK, "Got unexpected status code");
    });
});
