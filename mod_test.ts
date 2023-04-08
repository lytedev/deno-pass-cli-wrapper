import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.181.0/testing/mock.ts";
import {
  _internals,
  EntryNotFoundError,
  fieldFor,
  FieldNotFoundError,
  passwordFor,
} from "./mod.ts";

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

  stub(_internals, "entryContents", (entry: string) => {
    if (entry in entries) {
      return Promise.resolve(entries[entry]);
    }
    return Promise.reject(new EntryNotFoundError(entry));
  });

  assertEquals(await fieldFor("google.com/personal", "username"), "johnsmith");
  assertEquals(
    await _internals.entryContents("google.com/personal"),
    entries["google.com/personal"],
  );
  assertEquals(await passwordFor("google.com/personal"), "hunter2");
  assertEquals(await passwordFor("weirdly-formatted"), "username: johnsmith");

  assertRejects(
    () => _internals.entryContents("404-not-found"),
    EntryNotFoundError,
  );

  assertRejects(
    () => _internals.entryContents("404-not-found"),
    EntryNotFoundError,
  );

  assertRejects(
    () => fieldFor("404-not-found", "404-not-found"),
    EntryNotFoundError,
  );

  assertRejects(
    () => fieldFor("weirdly-formatted", "404-not-found"),
    FieldNotFoundError,
  );
});
