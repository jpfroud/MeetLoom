import { Router, type RequestHandler } from "express";
import { z } from "zod";
import type { Database } from "./db.js";
import type { Role, Session, User } from "../shared/model.js";
import type {
  PresentParticipant,
  PresenceResponse,
} from "../shared/presence.js";
import { allBlocks } from "../shared/domain.js";
import { fail } from "./security.js";
import { sessionCollaborators } from "./collaborators.js";

type Member = Pick<PresentParticipant, "userId" | "name" | "role">;
type Heartbeat = {
  sessionId: string;
  userId: string;
  clientId: string;
  blockId: string | null;
  editing: boolean;
  lastSeen: number;
};
/** Ephemeral state for the supported single application replica. No activity
 * history is persisted. Membership is checked again on every response. */
export class PresenceStore {
  private entries = new Map<string, Heartbeat>();
  constructor(
    readonly ttlMs = 30_000,
    private now = Date.now,
    private limit = 5000,
  ) {}
  private prune() {
    const cutoff = this.now() - this.ttlMs;
    for (const [key, entry] of this.entries)
      if (entry.lastSeen <= cutoff) this.entries.delete(key);
  }
  touch(value: Omit<Heartbeat, "lastSeen">) {
    this.prune();
    const key = `${value.sessionId}:${value.userId}:${value.clientId}`;
    if (
      !this.entries.has(key) &&
      (this.entries.size >= this.limit ||
        [...this.entries.values()].filter(
          (entry) => entry.userId === value.userId,
        ).length >= 20)
    )
      fail(429, "PRESENCE_LIMIT", "Too many active presence windows.");
    this.entries.set(key, { ...value, lastSeen: this.now() });
  }
  leave(sessionId: string, userId: string, clientId: string) {
    this.entries.delete(`${sessionId}:${userId}:${clientId}`);
  }
  list(sessionId: string, members: Member[]): PresenceResponse {
    this.prune();
    const allowed = new Map(members.map((member) => [member.userId, member])),
      users = new Map<string, PresentParticipant>();
    for (const [key, entry] of this.entries) {
      if (entry.sessionId !== sessionId) continue;
      const member = allowed.get(entry.userId);
      if (!member) {
        this.entries.delete(key);
        continue;
      }
      const previous = users.get(entry.userId);
      const latest = !previous || entry.lastSeen >= previous.lastSeen;
      users.set(entry.userId, {
        ...member,
        blockId: latest ? entry.blockId : previous.blockId,
        editing:
          ["owner", "editor"].includes(member.role) &&
          (latest ? entry.editing : previous.editing),
        lastSeen: Math.max(previous?.lastSeen ?? 0, entry.lastSeen),
        devices: (previous?.devices ?? 0) + 1,
      });
    }
    return {
      participants: [...users.values()].sort(
        (a, b) =>
          a.name.localeCompare(b.name) || a.userId.localeCompare(b.userId),
      ),
      serverTime: this.now(),
      expiresInMs: this.ttlMs,
    };
  }
}

export function createPresenceRouter(dependencies: {
  db: Database;
  authenticated: RequestHandler;
  accessible: (
    sessionId: string,
    userId: string,
  ) => Promise<{ session: Session; role: Role }>;
  store?: PresenceStore;
}) {
  const router = Router(),
    store = dependencies.store ?? new PresenceStore();
  const path = "/sessions/:id/presence";
  router.use(path, dependencies.authenticated);
  const getId = (value: unknown) => z.string().min(1).max(80).parse(value);
  const members = async (sessionId: string) =>
    (await sessionCollaborators(dependencies.db, sessionId)).map(
      ({ id, ...member }) => ({ ...member, userId: id }),
    );
  router.get(path, async (request, response) => {
    const id = getId(request.params.id),
      user = response.locals.user as User;
    await dependencies.accessible(id, user.id);
    response.json(store.list(id, await members(id)));
  });
  router.post(path, async (request, response) => {
    const id = getId(request.params.id),
      user = response.locals.user as User;
    const input = z
      .object({
        clientId: z.uuid(),
        blockId: z.string().min(1).max(80).nullable().default(null),
        editing: z.boolean().default(false),
      })
      .strict()
      .parse(request.body);
    const { session, role } = await dependencies.accessible(id, user.id);
    if (
      input.blockId &&
      !session.days.some((day) =>
        allBlocks(day.blocks).some((block) => block.id === input.blockId),
      )
    )
      return fail(400, "INVALID_BLOCK", "This block does not exist.");
    store.touch({
      sessionId: id,
      userId: user.id,
      clientId: input.clientId,
      blockId: input.blockId,
      editing: input.editing && ["owner", "editor"].includes(role),
    });
    response.json(store.list(id, await members(id)));
  });
  router.delete(path, async (request, response) => {
    const id = getId(request.params.id),
      user = response.locals.user as User;
    await dependencies.accessible(id, user.id);
    const input = z.object({ clientId: z.uuid() }).strict().parse(request.body);
    store.leave(id, user.id, input.clientId);
    response.status(204).end();
  });
  return router;
}
