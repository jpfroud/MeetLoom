import type { Block } from "../shared/model";
import { allBlocks, cloneBlockTree, mapBlocks } from "../shared/domain";

const normalized = (blocks: Block[]) => mapBlocks(blocks, (block) => block);

export function removeBlockFromTree(blocks: Block[], id: string): Block[] {
  return normalized(
    blocks
      .filter((block) => block.id !== id)
      .map((block) => ({
        ...block,
        ...(block.children
          ? { children: removeBlockFromTree(block.children, id) }
          : {}),
        ...(block.rooms
          ? {
              rooms: block.rooms.map((room) => ({
                ...room,
                blocks: removeBlockFromTree(room.blocks, id),
              })),
            }
          : {}),
      })),
  );
}

export function insertBlockAfter(
  blocks: Block[],
  afterId: string,
  inserted: Block,
): Block[] {
  return normalized(
    blocks.flatMap((block) => {
      const updated = {
        ...block,
        ...(block.children
          ? { children: insertBlockAfter(block.children, afterId, inserted) }
          : {}),
        ...(block.rooms
          ? {
              rooms: block.rooms.map((room) => ({
                ...room,
                blocks: insertBlockAfter(room.blocks, afterId, inserted),
              })),
            }
          : {}),
      };
      return block.id === afterId ? [updated, inserted] : [updated];
    }),
  );
}

export function duplicateBlockInTree(blocks: Block[], id: string): Block[] {
  const original = allBlocks(blocks).find((block) => block.id === id);
  return original
    ? insertBlockAfter(blocks, id, cloneBlockTree(original))
    : blocks;
}

export function moveBlockInTree(
  blocks: Block[],
  id: string,
  direction: -1 | 1,
): Block[] {
  const index = blocks.findIndex((block) => block.id === id),
    next = index + direction;
  if (index >= 0) {
    if (next < 0 || next >= blocks.length) return blocks;
    const reordered = [...blocks];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    return reordered;
  }
  return normalized(
    blocks.map((block) => ({
      ...block,
      ...(block.children
        ? { children: moveBlockInTree(block.children, id, direction) }
        : {}),
      ...(block.rooms
        ? {
            rooms: block.rooms.map((room) => ({
              ...room,
              blocks: moveBlockInTree(room.blocks, id, direction),
            })),
          }
        : {}),
    })),
  );
}

/** Move to the end of a group's children or a room's list. Containers cannot be
 * moved into themselves or descendants, and a failed lookup never loses data. */
export function moveBlockToList(
  root: Block,
  id: string,
  listId: string,
): Block {
  const source = allBlocks([root]).find((block) => block.id === id);
  if (!source || source.id === root.id) return root;
  const descendants = allBlocks([source]);
  if (
    descendants.some(
      (block) =>
        block.id === listId || block.rooms?.some((room) => room.id === listId),
    )
  )
    return root;
  const validTarget = allBlocks([root]).some(
    (block) =>
      (block.kind === "group" && block.id === listId) ||
      block.rooms?.some((room) => room.id === listId),
  );
  if (!validTarget) return root;
  return mapBlocks(removeBlockFromTree([root], id), (block) => {
    if (block.kind === "group" && block.id === listId)
      return { ...block, children: [...(block.children ?? []), source] };
    if (block.rooms)
      return {
        ...block,
        rooms: block.rooms.map((room) =>
          room.id === listId
            ? { ...room, blocks: [...room.blocks, source] }
            : room,
        ),
      };
    return block;
  })[0];
}
