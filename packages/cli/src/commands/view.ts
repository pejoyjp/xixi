import { readIndex } from "@xixi/core";
import { printInstalled } from "../ui/printer";

export type ViewOptions = {
  name?: string;
  json?: boolean;
};

export async function runView(options: ViewOptions): Promise<void> {
  const index = await readIndex();
  const filteredEntries = Object.entries(index).filter(([key, value]) => {
    if (options.name && !key.includes(options.name) && !value.name.includes(options.name)) {
      return false;
    }
    return true;
  });

  const filtered = Object.fromEntries(filteredEntries);

  if (options.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  printInstalled(filtered);
}
