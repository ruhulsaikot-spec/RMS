#!/usr/bin/env python3
"""
RMS Backend - Database Migration Helper Script

Convenience script for common Alembic migration operations.
Usage:
    python scripts/migrate.py generate "add user table"
    python scripts/migrate.py upgrade
    python scripts/migrate.py downgrade
    python scripts/migrate.py current
    python scripts/migrate.py history
"""

import subprocess
import sys


def run_alembic(args: list[str]) -> int:
    """Run an alembic command with the given arguments."""
    cmd = ["alembic"] + args
    print(f"Running: {' '.join(cmd)}")
    return subprocess.call(cmd)


def main() -> None:
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    command = sys.argv[1]

    match command:
        case "generate" | "gen":
            if len(sys.argv) < 3:
                print("Error: Migration message required")
                print('Usage: python scripts/migrate.py generate "description"')
                sys.exit(1)
            message = sys.argv[2]
            sys.exit(run_alembic(["revision", "--autogenerate", "-m", message]))

        case "upgrade":
            revision = sys.argv[2] if len(sys.argv) > 2 else "head"
            sys.exit(run_alembic(["upgrade", revision]))

        case "downgrade":
            revision = sys.argv[2] if len(sys.argv) > 2 else "-1"
            sys.exit(run_alembic(["downgrade", revision]))

        case "current":
            sys.exit(run_alembic(["current"]))

        case "history":
            sys.exit(run_alembic(["history", "--verbose"]))

        case "reset":
            print("⚠️  This will drop all tables and recreate them!")
            confirm = input("Are you sure? (yes/no): ")
            if confirm == "yes":
                sys.exit(run_alembic(["downgrade", "base"]) or run_alembic(["upgrade", "head"]))
            else:
                print("Cancelled.")

        case _:
            print(f"Unknown command: {command}")
            print(__doc__)
            sys.exit(1)


if __name__ == "__main__":
    main()
