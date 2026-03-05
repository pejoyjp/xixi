# xixi (Company Skill CLI)

`xixi` is a Node.js CLI for creating, publishing, installing, and viewing internal skills grouped by department.

## Requirements

- Node.js >= 18
- pnpm >= 10
- git configured with credentials (SSH key or `gh auth`)

## Workspace

```bash
pnpm install
pnpm build
pnpm test
```

## Packages

- `packages/core`: schemas, config, manifest validation, index store
- `packages/cli`: command parsing, prompts, git/repo/file services

## Config

On first run, `xixi` auto-creates:

- config: `~/.xixi/config.json`
- index: `~/.xixi/index.json`
- install root: `~/.xixi/installed`

Default `config.json`:

```json
{
  "skillsRepo": {
    "url": "git@github.com:<org>/xixi-skills.git"
  },
  "installRoot": "/Users/<you>/.xixi/installed",
  "tmpRoot": "/tmp",
  "depts": ["engineering", "ops", "sales"]
}
```

## Commands

### Init

```bash
xixi init
```

Creates `./<name>/` with:
- `xixi.yaml`
- `README.md`
- `prompt.md`

### Publish

```bash
xixi publish --path . --dept engineering
xixi publish --force
```

Behavior:
- validates `xixi.yaml`
- enforces selected `dept === manifest.dept`
- clones remote skills repo
- writes to `<dept>/<name>/`
- commits and pushes

### Install

```bash
xixi install engineering/pr-description
xixi install engineering/pr-description --ref main
```

Behavior:
- clones remote repo
- checks target skill exists
- copies into `~/.xixi/installed/<dept>/<name>`
- updates `~/.xixi/index.json`
- prompts before overwrite if already installed

### View

```bash
xixi view
xixi view --dept engineering
xixi view --name pr
xixi view --json
```

Default output is grouped by department.

## Error Handling

CLI uses `XixiError(code, message, hint)` and supports:

```bash
xixi --verbose <command>
```

Verbose mode prints stack details and underlying failure context.

## Troubleshooting

- Push failed:
  - ensure you have write permission to the skills repo
  - or fork and push to your fork (PR mode is planned in future versions)
- Clone/auth failed:
  - run `ssh -T git@github.com`
  - verify your git credential helper or SSH key setup

## Example Skill

See `examples/sample-skill` for a minimal skill structure.

