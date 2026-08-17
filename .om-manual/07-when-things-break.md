# 7. ARH-MAKAN — when things break

_Where to look when something goes wrong: logs, history, and recovery notes found in the project. Generated directly from project records._

## Logs and records this project works with

_No log or JSONL files were found in the project tree at generation time. Check the operating chapter for where the project writes its output._

## Recovery and rollback notes found in the project

- `.claude/skills/fnb-taste-palette-design/SKILL.md:111` — - rollback_requirement
- `.claude/skills/fnb-taste-palette-design/checklists/fnb-taste-review-checklist.md:69` — - Rollback or previous snapshot is planned.
- `.claude/skills/fnb-taste-palette-design/references/github-native-governance-options.md:78` — - rollback path;
- `docs/decisions/0004-realtime-hybrid-state-sync-and-offline-resilience.md:15` — - Full active state (Orders, Table matrix, 86 inventory) is continuously serialized to persistent storage. If a device refreshes or loses connection, state is restored immediately.

## Change history (for undoing mistakes)

The project is tracked by git. To see what changed recently:

```bash
git -C "D:/ARH-GITHUB/arhsmoque2/ARH-MAKAN" log --oneline -n 20 -- "D:\ARH-GITHUB\arhsmoque2\ARH-MAKAN"
```

