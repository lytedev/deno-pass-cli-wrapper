import { assertEquals } from "https://deno.land/std@0.181.0/testing/asserts.ts";
import { stub } from "https://deno.land/std@0.181.0/testing/mock.ts";
import { _internals, entryContents, fieldFor, passwordFor } from "./mod.ts";

Deno.test("string processing", async () => {
  const entries: Record<string, string> = {
    "google.com/personal": `hunter2
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
});
