import type { Batch } from "@/lib/types";

interface TreeNode {
  batch: Batch;
  children: TreeNode[];
}

function buildTree(rows: Batch[]): TreeNode[] {
  const byId = new Map(rows.map((b) => [b.id, { batch: b, children: [] as TreeNode[] }]));
  const roots: TreeNode[] = [];

  for (const node of byId.values()) {
    const parentId = node.batch.parentBatchId;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function Node({ node, currentId }: { node: TreeNode; currentId: string }) {
  const isCurrent = node.batch.id === currentId;
  return (
    <li>
      <div
        className={`inline-block rounded-md px-2 py-1 text-sm ${
          isCurrent ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg)]"
        }`}
      >
        {node.batch.stage.replace(/_/g, " ")}
        <span className="ml-2 font-mono text-xs opacity-70">{node.batch.id.slice(0, 8)}</span>
      </div>
      {node.children.length > 0 && (
        <ul className="mt-2 ml-4 flex flex-col gap-2 border-l border-[var(--color-border)] pl-4">
          {node.children.map((child) => (
            <Node key={child.batch.id} node={child} currentId={currentId} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function LineageTree({ rows, currentId }: { rows: Batch[]; currentId: string }) {
  const roots = buildTree(rows);
  if (roots.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)]">No lineage recorded.</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {roots.map((root) => (
        <Node key={root.batch.id} node={root} currentId={currentId} />
      ))}
    </ul>
  );
}
