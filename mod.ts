async function passOutput(args: string[]): Promise<string> {
  const command = Deno.run({
    cmd: ["pass", ...args],
    stdout: "piped",
    stdin: "null",
    stderr: "null",
  });
  const status = await command.status();
  if (!status.success) {
    throw Error("Underlying 'pass' command exited unsuccessfully.");
  }
  const output = await command.output();
  return new TextDecoder().decode(output);
}

export const _internals = { passOutput };

/**
 * Gets entire (trimmed) contents from the specified entry in the password
 * store.
 *
 * Will throw if the entry does not exist.
 */
export async function entryContents(
  entry: string,
): Promise<string> {
  return (await _internals.passOutput([entry])).trim();
}

/**
 * Gets the first non-empty line from the specified entry in the password store.
 *
 * This may result in an empty string depending on the format of the file.
 *
 * Will throw if the entry does not exist.
 */
export async function passwordFor(entry: string): Promise<string> {
  return (await _internals.passOutput([entry])).trim().split("\n")[0];
}

/**
 * Equivalent to retrieving the contents and looking for a line that starts with
 * `${fieldName}:` (the fieldName argument followed by a colon). The remainder
 * of the line (everything after the first colon) will be trimmed and returned.
 *
 * For example, if you run `pass google.com/personal` and get the following output:
 *
 * hunter2
 * username: johnsmith
 * full_email:johnsmith@gmail.com
 * app_password:    abcd 1234 efgh 5678
 *
 * Then `fieldFor("google.com/personal", "app_password")` would return `abcd 1234 efgh 5678`.
 *
 * Will throw if the entry does not exist or the field cannot be found.
 */
export async function fieldFor(
  entry: string,
  fieldName: string,
): Promise<string> {
  const scan = `${fieldName}:`;
  const lines = (await _internals.passOutput([entry]))?.trim().split("\n");
  for (const line of lines) {
    if (line.trim().startsWith(scan)) {
      return line.substring(scan.length).trim();
    }
  }
  throw Error(`Could not find field '${fieldName}'`);
}

/*
// Maybe someday we'll get fancy!

export class InvocationResult {
  constructor(opts,
}

export type FileDescriptor = "inherit" | "piped" | "null" | number;

export interface InvokeInit {
  args?: string[],
  stdout?: FileDescriptor,
  stderr?: FileDescriptor,
  stdin?: FileDescriptor,
}

export async function rawInvoke(opts: InvokeInit): Promise<InvocationResult> {
  const { args, stdout, stderr, stdin } = opts;
  const run = Deno.run({
    cmd: ["pass"].concat(args || []),
    stdout: stdout || "piped",
    stdin: stdin || "null",
    stderr: stderr || "piped",
  });
  return new InvocationResult(opts, run.status(), run.stdout, run.stderr);
}
*/
