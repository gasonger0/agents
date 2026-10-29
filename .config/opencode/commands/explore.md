---
description: "Search in local files and directories"
agent: explore
subtask: true
---
Search for references matching the following query: $ARGUMENTS

Search in files, directories, and file names. Produce a maximally concise summary of the matches found. Each entry must contain:

1. File/directory name where the match was found
2. Short context of the match (in the name or in the text; if the match was found in the text — specify what it is used for, in which function or method)

## Constraints (MANDATORY)

- **READ-ONLY:** You may only read files and list directories. You MUST NOT edit, write, create, or delete any files. You MUST NOT run any command that modifies state.
- **No web access:** Do NOT search the internet or any external resources.
- **Scope restriction:** Do NOT search outside the directory in which the agent was started, or the directory explicitly specified in the query.
- **Configuration files require confirmation:** Before reading any of the following file types, you MUST ask the user for explicit confirmation first:
  - `.ini`, `.env`, `.xml` files
  - Any file whose name contains `conf` (e.g., `*.conf`, `*.config`, `config.*`, `nginx.conf`, `php.ini`, `.env.local`, `*.conf.d/*`)
  - Any other file that is clearly a configuration file (secrets, credentials, environment settings, service configs)

  When asking, list the exact file paths you intend to read and explain why. Do NOT read these files until the user explicitly approves.