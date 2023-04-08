export class EntryNotFoundError extends Error {
  constructor(entry: string, options?: ErrorOptions) {
    super(
      `Entry '${entry}' caused underlying 'pass' command to exit unsuccessfully`,
      options,
    );
  }
}

export class FieldNotFoundError extends Error {
  constructor(entry: string, field: string, options?: ErrorOptions) {
    super(
      `Could not find field '${field}' in entry '${entry}'`,
      options,
    );
  }
}

/**
 * Gets entire (trimmed) contents of `entry` in the password store.
 *
 * If `entry` does not exist, an `EntryNotFoundError` is thrown.
 */
export async function entryContents(
  entry: string,
): Promise<string> {
  const command = Deno.run({
    cmd: ["pass", entry],
    stdout: "piped",
    stdin: "null",
    stderr: "null",
  });
  const status = await command.status();
  if (!status.success) {
    throw new EntryNotFoundError(entry);
  }
  return new TextDecoder().decode(await command.output());
}

export const _internals = { entryContents };

/**
 * Gets the first non-empty line from the specified entry in the password store.
 * This may result in an empty string depending on the format of the file.
 *
 * If `entry` does not exist, an `EntryNotFoundError` is thrown.
 */
export async function passwordFor(entry: string): Promise<string> {
  return (await _internals.entryContents(entry)).trim().split("\n")[0];
}

/**
 * Equivalent to retrieving the contents and looking for a line that starts with
 * `${fieldName}:` (the fieldName argument followed by a colon). The remainder
 * of the line (everything after the first colon) will be trimmed and returned.
 *
 * For example, if you run `pass google.com/personal` and get the following output:
 *
 * ```
 * hunter2
 * username: johnsmith
 * full_email:johnsmith@gmail.com
 * app_password:    abcd 1234 efgh 5678
 * ```
 *
 * Then `fieldFor("google.com/personal", "app_password")` would return `abcd 1234 efgh 5678`.
 *
 * If `entry` does not exist, an `EntryNotFoundError` is thrown.
 * If `field` cannot be found in the entry, a {@link FieldNotFoundError} is thrown.
 */
export async function fieldFor(
  entry: string,
  field: string,
): Promise<string> {
  const scan = `${field}:`;
  const lines = (await _internals.entryContents(entry))?.trim().split("\n");
  for (const line of lines) {
    if (line.trim().startsWith(scan)) {
      return line.substring(scan.length).trim();
    }
  }
  throw new FieldNotFoundError(entry, field);
}
