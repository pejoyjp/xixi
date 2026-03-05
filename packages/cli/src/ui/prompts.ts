import inquirer from "inquirer";

export async function selectDept(depts: string[], message = "Select department"): Promise<string> {
  const answer = await inquirer.prompt<{ dept: string }>([
    {
      type: "list",
      name: "dept",
      message,
      choices: depts
    }
  ]);
  return answer.dept;
}

export async function confirm(message: string, defaultValue = false): Promise<boolean> {
  const answer = await inquirer.prompt<{ ok: boolean }>([
    {
      type: "confirm",
      name: "ok",
      message,
      default: defaultValue
    }
  ]);
  return answer.ok;
}
