import { ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import type { Block } from "../shared/model";
import { blockDuration, newBlock } from "../shared/domain";
import { useI18n } from "./i18n";
import { DurationField } from "./TimeFields";
import { durationLabel } from "./ui";

export default function GroupOutline({
  block,
  editable,
  change,
  open,
}: {
  block: Block;
  editable: boolean;
  change: (id: string, patch: Partial<Block>) => void;
  open: (id: string) => void;
}) {
  const { t, locale } = useI18n();
  const inputs = useRef(new Map<string, HTMLInputElement>()),
    focus = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (focus.current) {
      const input = inputs.current.get(focus.current);
      if (input) {
        input.focus();
        input.select();
        focus.current = null;
      }
    }
  });
  const list = (blocks: Block[], roomId?: string) =>
    blocks.map((child) => (
      <div className="group-outline-child" key={child.id}>
        <div className="group-outline-row">
          <input
            ref={(element) => {
              if (element) inputs.current.set(child.id, element);
              else inputs.current.delete(child.id);
            }}
            aria-label={`${t("Titre du bloc dans le groupe", "Group block title")}`}
            value={child.title}
            readOnly={!editable}
            maxLength={200}
            onChange={(e) => change(child.id, { title: e.target.value })}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                editable &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                const next = newBlock(locale),
                  items = [...blocks],
                  index = items.findIndex((item) => item.id === child.id);
                items.splice(index + 1, 0, next);
                focus.current = next.id;
                change(
                  block.id,
                  roomId
                    ? {
                        rooms: block.rooms?.map((room) =>
                          room.id === roomId
                            ? { ...room, blocks: items }
                            : room,
                        ),
                      }
                    : { children: items },
                );
              }
            }}
          />
          <DurationField
            value={blockDuration(child)}
            label={`${t("Durée de", "Duration of")} ${child.title}`}
            readOnly={
              !editable ||
              ["note", "group", "parallel"].includes(child.kind ?? "")
            }
            change={(duration) => change(child.id, { duration })}
          />
          <button
            className="icon-button"
            title={`${t("Ouvrir", "Open")} ${child.title}`}
            onClick={() => open(child.id)}
          >
            <ArrowRight size={15} />
          </button>
        </div>
        {(child.kind === "group" || child.kind === "parallel") && (
          <GroupOutline
            block={child}
            editable={editable}
            change={change}
            open={open}
          />
        )}
      </div>
    ));
  if (block.kind === "parallel")
    return (
      <div className="parallel-outline">
        {block.rooms?.map((room) => (
          <section key={room.id}>
            <header>
              {room.title}
              <span>
                {durationLabel(
                  room.blocks.reduce((n, b) => n + blockDuration(b), 0),
                )}
              </span>
            </header>
            {list(room.blocks, room.id)}
            {!room.blocks.length && (
              <button className="toolbar-button" onClick={() => open(block.id)}>
                {t("Ajouter des activités", "Add activities")}
              </button>
            )}
          </section>
        ))}
      </div>
    );
  return (
    <div className="group-outline">
      {list(block.children ?? [])}
      {!block.children?.length && (
        <button className="toolbar-button" onClick={() => open(block.id)}>
          {t("Ajouter des activités au groupe", "Add activities to group")}
        </button>
      )}
    </div>
  );
}
