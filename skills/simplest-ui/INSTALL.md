# Install the Simplest UI skill

The package ships the portable Agent Skill at `skills/simplest-ui`. Installing the npm package does not activate it automatically: copy it into an agent's skill directory, or configure the agent to load the package directory.

## OpenCode V2

For a project-local setup, add the package skill directory to `opencode.jsonc`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": ["./node_modules/@luisrodonccs/simplest-ui/skills"]
}
```

OpenCode loads the nested `simplest-ui/SKILL.md` file from that directory. Start a new session or run `/reload`, then invoke it as `@simplest-ui` or let OpenCode select it for a relevant Simplest UI task.

To make a copied skill available in every project, copy `simplest-ui` to `~/.config/opencode/skills/`.

## Claude Code

For a project-local setup, copy the skill folder into `.claude/skills/`.

**PowerShell**

```powershell
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Copy-Item -Recurse node_modules/@luisrodonccs/simplest-ui/skills/simplest-ui .claude/skills/simplest-ui
```

**macOS or Linux**

```sh
mkdir -p .claude/skills
cp -R node_modules/@luisrodonccs/simplest-ui/skills/simplest-ui .claude/skills/simplest-ui
```

Restart the session or run `/reload-skills`, then invoke `/simplest-ui`. For a personal installation, use `~/.claude/skills/simplest-ui` instead.

## Other Agent Skills clients

The skill follows the open [Agent Skills](https://agentskills.io) format. Copy the `simplest-ui` directory, including `SKILL.md` and `references/`, to the client-specific skills directory. Consult that client's documentation for its discovery path and reload command.

## Verify the installation

Ask the agent to build a card with a status and action in a project using Simplest UI. It should select `ui-card`, `ui-badge`, and `ui-button`, inspect `components.manifest.json`, and avoid inventing a `<sui-card>` element.
