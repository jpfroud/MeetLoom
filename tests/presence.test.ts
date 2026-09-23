import test from "node:test";
import assert from "node:assert/strict";
import { PresenceStore } from "../server/presence.js";
import { harness } from "./support.js";

test("presence expires, aggregates devices and immediately drops revoked members", () => {
  let now = 1000;
  const store = new PresenceStore(30_000, () => now);
  const members = [
    { userId: "owner", name: "Owner", role: "owner" as const },
    { userId: "guest", name: "Guest", role: "editor" as const },
  ];
  store.touch({
    sessionId: "one",
    userId: "owner",
    clientId: "first",
    blockId: "a",
    editing: true,
  });
  store.touch({
    sessionId: "one",
    userId: "owner",
    clientId: "second",
    blockId: "b",
    editing: true,
  });
  store.touch({
    sessionId: "one",
    userId: "guest",
    clientId: "guest-tab",
    blockId: null,
    editing: false,
  });
  store.touch({
    sessionId: "other",
    userId: "owner",
    clientId: "elsewhere",
    blockId: null,
    editing: false,
  });
  const present = store.list("one", members);
  assert.equal(present.participants.length, 2);
  assert.equal(
    present.participants.find((person) => person.userId === "owner")!.devices,
    2,
  );
  assert.equal(store.list("one", [members[0]]).participants.length, 1);
  assert.equal(
    store.list("one", members).participants.length,
    1,
    "membership restoration does not resurrect a deleted heartbeat",
  );
  store.leave("one", "owner", "second");
  assert.equal(store.list("one", members).participants[0].devices, 1);
  now = 31_000;
  assert.equal(store.list("one", members).participants.length, 0);
});

test("presence bounds memory and cannot claim editing after a role downgrade", () => {
  const store = new PresenceStore(30_000, () => 1000, 1);
  store.touch({
    sessionId: "one",
    userId: "owner",
    clientId: "first",
    blockId: "a",
    editing: true,
  });
  assert.equal(
    store.list("one", [{ userId: "owner", name: "Owner", role: "viewer" }])
      .participants[0].editing,
    false,
  );
  assert.throws(
    () =>
      store.touch({
        sessionId: "two",
        userId: "guest",
        clientId: "second",
        blockId: null,
        editing: false,
      }),
    /Too many/,
  );
  store.touch({
    sessionId: "one",
    userId: "owner",
    clientId: "first",
    blockId: "b",
    editing: true,
  });
});

test("presence API is session scoped, never trusts supplied identities, and reflects membership revocation", async (t) => {
  const h = await harness(t),
    owner = await h.setup();
  const session = await h.session(),
    guest = await h.account("presence@example.test"),
    stranger = await h.account("stranger-presence@example.test");
  const route = `/sessions/${session.id}/presence`;
  assert.equal((await h.client().request(route)).status, 401);
  assert.equal((await stranger.client.request(route)).status, 404);
  assert.equal(
    (
      await h.owner.request(`/sessions/${session.id}/members`, "POST", {
        email: guest.user.email,
        role: "viewer",
      })
    ).status,
    201,
  );
  const ownerTab = crypto.randomUUID(),
    guestTab = crypto.randomUUID();
  assert.equal(
    (
      await h.owner.request(route, "POST", {
        clientId: ownerTab,
        blockId: session.days[0].blocks[0].id,
        editing: true,
        userId: guest.user.id,
      })
    ).status,
    400,
  );
  const joined = await h.owner.request(route, "POST", {
    clientId: ownerTab,
    blockId: session.days[0].blocks[0].id,
    editing: true,
  });
  assert.equal(joined.status, 200, JSON.stringify(joined.body));
  assert.equal(joined.body.participants[0].userId, owner.id);
  assert.equal(Object.hasOwn(joined.body.participants[0], "email"), false);
  const viewing = await guest.client.request(route, "POST", {
    clientId: guestTab,
    editing: true,
  });
  assert.equal(viewing.status, 200);
  assert.equal(
    viewing.body.participants.find(
      (person: { userId: string }) => person.userId === guest.user.id,
    ).editing,
    false,
  );
  assert.equal(
    (
      await guest.client.request(route, "POST", {
        clientId: guestTab,
        blockId: "unknown",
      })
    ).status,
    400,
  );
  const second = await h.session();
  assert.equal(
    (await h.owner.request(`/sessions/${second.id}/presence`)).body.participants
      .length,
    0,
  );
  assert.equal(
    (
      await h.owner.request(
        `/sessions/${session.id}/members/${guest.user.id}`,
        "DELETE",
        {},
      )
    ).status,
    200,
  );
  assert.equal((await guest.client.request(route)).status, 404);
  assert.equal((await h.owner.request(route)).body.participants.length, 1);
  assert.equal(
    (await h.owner.request(route, "DELETE", { clientId: ownerTab })).status,
    204,
  );
  assert.equal((await h.owner.request(route)).body.participants.length, 0);
});
