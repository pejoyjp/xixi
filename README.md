# xixi (Company Skill CLI)

`xixi` is a Node.js CLI for creating, publishing, installing, and viewing internal skills.

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

- `packages/core`: schemas, config, skill manifest validation, index store
- `packages/cli`: command parsing, prompts, git/repo/file services

## Config

On first run, `xixi` auto-creates:

- config: `~/.xixi/config.json`
- index: `~/.xixi/index.json`
- install root: `~/.codex/skills`

Default `config.json`:

```json
{
  "skillsRepo": {
    "url": "git@github.com:<org>/xixi-skills.git"
  },
  "installRoot": "/Users/<you>/.codex/skills",
  "tmpRoot": "/tmp"
}
```

## Commands

### Init

```bash
xixi init
```

Creates `./skills/<name>/` with:
- `SKILL.md`
- `agents/openai.yaml`

### Publish

```bash
xixi publish --path ./skills/pr-description
xixi publish pr-description
xixi publish --force
```

Behavior:
- validates `SKILL.md` frontmatter and `agents/openai.yaml`
- supports publishing installed skill by name from `~/.codex/skills/<name>`
- clones remote skills repo
- writes to `skills/<name>/`
- commits and pushes

### Install

```bash
xixi install pr-description
xixi install pr-description --ref main
```

Behavior:
- clones remote repo
- checks target skill exists
- copies into `~/.codex/skills/<name>` (default)
- updates `~/.xixi/index.json`
- prompts before overwrite if already installed

### Uninstall

```bash
xixi uninstall pr-description
xixi uninstall pr-description --force
```

Behavior:
- removes local installed skill from `~/.codex/skills/<name>`
- removes index record from `~/.xixi/index.json`
- asks for confirmation unless `--force`

### Upgrade

```bash
xixi upgrade
xixi upgrade pr-description
xixi upgrade --all --force
```

Behavior:
- upgrades installed skills from remote latest (default branch head)
- updates local files under `~/.codex/skills/<name>`
- updates index source ref to the latest commit hash

### Remote

```bash
xixi remote
xixi remote --name pr
xixi remote --json
```

Behavior:
- clones remote repo
- scans `skills/` and lists available skill names
- supports optional name filter and JSON output

### View

```bash
xixi view
xixi view --name pr
xixi view --json
```

Default output is a flat skill list.

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
