import { test } from "node:test";
import assert from "node:assert/strict";
import { parseArgs } from "../src/index.js";

test("positionals and long options", () => {
  assert.deepEqual(parseArgs(["a", "--name", "app", "--port=80", "b"]), { _: ["a", "b"], name: "app", port: 80 });
});

test("boolean flags do not swallow the next argument", () => {
  assert.deepEqual(parseArgs(["--verbose", "file"], { boolean: ["verbose"] }), { _: ["file"], verbose: true });
});

test("unknown flags followed by another flag are true", () => {
  assert.deepEqual(parseArgs(["--a", "--b"]), { _: [], a: true, b: true });
});

test("aliases and grouped short flags", () => {
  const r = parseArgs(["-vp", "8080", "-q"], { boolean: ["verbose", "q"], alias: { v: "verbose", p: "port" } });
  assert.deepEqual(r, { _: [], verbose: true, port: 8080, q: true });
});

test("--no- negation", () => {
  assert.equal(parseArgs(["--no-color"], { boolean: ["color"] }).color, false);
});

test("repeated options collect into an array", () => {
  assert.deepEqual(parseArgs(["--tag", "a", "--tag", "b", "--tag=c"]).tag, ["a", "b", "c"]);
});

test("-- ends option parsing", () => {
  assert.deepEqual(parseArgs(["--x", "--", "--not-a-flag", "-y"]), { _: ["--not-a-flag", "-y"], x: true });
});

test("string option keeps numeric-looking values as text", () => {
  assert.equal(parseArgs(["--id", "007"], { string: ["id"] }).id, "007");
  assert.equal(parseArgs(["--id", "007"]).id, 7);
});

test("negative numbers are values, not flags", () => {
  assert.deepEqual(parseArgs(["--offset", "-5", "-3"]), { _: [-3], offset: -5 });
  assert.deepEqual(parseArgs(["-3"]), { _: [-3] });
});

test("defaults fill gaps and booleans default to false", () => {
  assert.deepEqual(parseArgs([], { boolean: ["v"], defaults: { port: 3000 } }), { _: [], port: 3000, v: false });
  assert.equal(parseArgs(["--port", "1"], { defaults: { port: 3000 } }).port, 1);
});
