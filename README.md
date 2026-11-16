# e2e CJK count repro

The replay cache in [e2e](https://github.com/e2e-inc/e2e) treats `42 items` as a count, but not `42件`. A Japanese tally that grows between runs is recorded as a step anchor, so the next replay is stale.

```sh
npm install
npm run repro
```

`repro.mjs` calls `describeDelta` and `deltaMismatch` from the installed `e2e@0.23.1` dist. They are not exported, so the script imports them by path. No model or browser is needed.

Output on `e2e@0.23.1`:

```text
# A tally that grows with every run (English works, Japanese does not)
41 items -> 42 items
  recorded endAnchors: [{"text":"Item added"}]
  next run ( 42 items -> 43 items ) mismatch: none (replay passes)
41件 -> 42件
  recorded endAnchors: [{"text":"42件"},{"text":"追加しました"}]
  next run ( 42件 -> 43件 ) mismatch: {"missing":[{"text":"42件"}],"present":[],"unrecordedAlerts":[]}

# A list screen opened by navigation (routeMoved = true)
  Showing 1 to 9 of 9 results -> endAnchors: [{"text":"Records"}]
  全9件中 1〜9件を表示 -> endAnchors: [{"text":"全9件中 1〜9件を表示"},{"text":"Records"}]
```
