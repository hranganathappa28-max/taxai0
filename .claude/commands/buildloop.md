---
description: Run the builder and checker in a loop until all checks pass (or a stop rule fires)
argument-hint: <bounded task, e.g. "fix the flaky bank-reconcile test">
allowed-tools: Read, Grep, Glob, Bash, Task
model: opus
---

Run this task as a build–check loop: $ARGUMENTS

1. Write a one-line brief: goal, files in scope, definition of done.
2. Dispatch the `builder` subagent (Task tool) to implement the task.
3. Dispatch the `checker` subagent (Task tool) to run all checks.
4. If the checker says `ALL GREEN`: STOP. Show me the checker's final output as proof.
5. If the checker says `FAILED`: pass the checker's exact failure report to the `builder` to fix, then go back to step 3.
6. Repeat up to 5 cycles. Print `Cycle N of 5` at the start of each iteration so progress is visible.

You are the decision-maker and coordinator only — do not write or test code yourself; that is the builder's and checker's job. The stop conditions in CLAUDE.md ("Loop stop rules") are binding — follow them exactly. Never report success without the checker's output from the FINAL cycle, and never weaken or delete a check to reach green.

Keep this loop on bounded tasks. If the task is large (e.g. "rewrite the whole X"), say so and ask me to split it before starting.
