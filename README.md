# xixi（企业技能 CLI）

`xixi` 是一个用于配合 Codex 管理内部 Skill 的命令行工具，支持创建、发布、安装、升级、查看与卸载。

## 环境要求

- Node.js >= 18
- pnpm >= 10（用于本仓库开发）
- git（用于 publish/install/remote 等远程仓库操作）

## 安装（推荐）

```bash
npm install -g https://codeload.github.com/pejoyjp/xixi/tar.gz/refs/heads/main
```

安装完成后可验证：

```bash
xixi --help
```

## 本地开发

```bash
pnpm install
pnpm build
pnpm test
```

## 配置说明

首次运行会自动创建：

- 配置文件：`~/.xixi/config.json`
- 索引文件：`~/.xixi/index.json`
- 默认安装目录：`~/.codex/skills`

默认 `config.json` 示例：

```json
{
  "skillsRepo": {
    "url": "git@github.com:<org>/xixi-skills.git"
  },
  "installRoot": "/Users/<you>/.codex/skills",
  "tmpRoot": "/tmp"
}
```

## Skill 目录结构规范

每个 skill 必须包含：

- `SKILL.md`
- `agents/openai.yaml`

推荐结构：

```text
skills/
  <skill-name>/
    SKILL.md
    agents/
      openai.yaml
```

`SKILL.md` 需包含 YAML frontmatter（至少 `name`、`description`），示例：

```md
---
name: pdf-processing
description: Extract text and tables from PDF files, fill forms, merge documents.
---

# PDF Processing
```

`agents/openai.yaml` 需包含：

```yaml
interface:
  display_name: "Code Review & Create PR"
  short_description: "Compare with dev, generate Chinese PR content, run review, and create PR via gh."
  default_prompt: "Compare the current branch with the latest dev branch, analyze the diff, generate a standardized Chinese PR title and description with code review findings, then push the branch and create a PR using gh if one does not already exist."
```

## 命令说明

### 1) 初始化 skill

```bash
xixi init
```

生成目录：`./skills/<name>/`

### 2) 发布 skill 到远程仓库

```bash
xixi publish --path ./skills/pr-description
xixi publish pr-description
xixi publish --force
```

说明：
- 自动校验 `SKILL.md` 与 `agents/openai.yaml`
- 远程路径写入 `skills/<name>/`

### 3) 安装 skill

```bash
xixi install pr-description
xixi install pr-description --ref main
```

说明：
- 默认安装到 `~/.codex/skills/<name>`
- 自动更新 `~/.xixi/index.json`

### 4) 卸载 skill

```bash
xixi uninstall pr-description
xixi uninstall pr-description --force
```

### 5) 升级 skill（从远程最新）

```bash
xixi upgrade
xixi upgrade pr-description
xixi upgrade --all --force
xixi upgrade --ref main
```

### 6) 升级 CLI 自身

```bash
xixi upgrade-cli
xixi self-upgrade
xixi upgrade-cli --source https://codeload.github.com/pejoyjp/xixi/tar.gz/refs/heads/main
```

### 7) 查看远程可用 skills

```bash
xixi remote
xixi remote --name pr
xixi remote --json
```

### 8) 查看本地已安装 skills

```bash
xixi view
xixi view --name pr
xixi view --json
```

