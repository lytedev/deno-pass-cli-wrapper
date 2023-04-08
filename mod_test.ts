import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.181.0/testing/mock.ts";
import { _internals, entryContents, fieldFor, passwordFor } from "./mod.ts";

Deno.test("string processing and throws", async () => {
  const entries: Record<string, string> = {
    "google.com/personal": `hunter2
username: johnsmith
full_email:johnsmith@gmail.com
app_password:    abcd 1234 efgh 5678`,
    "weirdly-formatted": `

username: johnsmith
full_email:johnsmith@gmail.com
app_password:    abcd 1234 efgh 5678`,
  };

  stub(_internals, "passOutput", ([entry]) => {
    if (entry in entries) {
      return Promise.resolve(entries[entry]);
    }
    throw new Error("Mocked pass throw");
  });

  assertEquals(await fieldFor("google.com/personal", "username"), "johnsmith");
  assertEquals(
    await entryContents("google.com/personal"),
    entries["google.com/personal"],
  );
  assertEquals(await passwordFor("google.com/personal"), "hunter2");
  assertEquals(await passwordFor("weirdly-formatted"), "username: johnsmith");

  assertRejects(
    () => entryContents("404-not-found"),
    Error,
    "Mocked pass throw",
  );

  assertRejects(
    () => entryContents("404-not-found"),
    Error,
    "Mocked pass throw",
  );

  assertRejects(
    () => fieldFor("404-not-found", "404-not-found"),
    Error,
    "Mocked pass throw",
  );

  assertRejects(
    () => fieldFor("weirdly-formatted", "404-not-found"),
    Error,
    "Could not find field '404-not-found'",
  );
});
