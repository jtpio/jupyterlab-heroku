import asyncio
import json
import os
import subprocess
from subprocess import PIPE, Popen


class Heroku:
    def __init__(self, root_dir):
        self.root_dir = os.path.realpath(os.path.expanduser(root_dir))

    def _error(self, code, message):
        return {"code": code, "message": message}

    async def _get_git_root(self, current_path):
        cmd = ["git", "rev-parse", "--show-toplevel"]
        p = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = await p.communicate()
        code = p.returncode
        if code != 0:
            return
        return out.decode("utf-8").strip()

    async def _get_remotes(self, current_path):
        # TODO: handle multiple remotes / apps
        cmd = ["git", "remote", "get-url", "heroku"]
        p = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = await p.communicate()
        code = p.returncode
        if code != 0:
            return []
        return out.decode("utf-8").splitlines()

    async def logs(self, current_path):
        cmd = ["heroku", "logs"]
        p = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = await p.communicate()
        code = p.returncode
        if code != 0:
            return self._error(code, err.decode("utf-8"))

        logs = out.decode("utf-8").splitlines()
        return {"code": code, "logs": logs}

    async def apps(self, current_path):
        all_remotes = await self._get_remotes(current_path)
        if not all_remotes:
            return {"code": 0, "apps": []}

        cmd = ["heroku", "apps", "--json"]
        p = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = await p.communicate()
        code = p.returncode
        if code != 0:
            return self._error(p.returncode, err.decode("utf-8"))

        all_apps = json.loads(out.decode("utf-8"))
        remotes = set(all_remotes)
        apps = [app for app in all_apps if app["git_url"] in remotes]
        return {"code": code, "apps": apps}

    async def deploy(self, current_path):
        all_remotes = await self._get_remotes(current_path)
        if not all_remotes:
            return self._error(500, "No Heroku remote in the current directory")

        cmd = ["git", "push", "heroku", "master"]
        p = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = await p.communicate()
        code = p.returncode
        if code != 0:
            return self._error(p.returncode, err.decode("utf-8"))

        return {"code": code}

    async def settings(self, current_path):
        all_remotes = await self._get_remotes(current_path)
        if not all_remotes:
            return self._error(500, "No Heroku remote in the current directory")

        git_root = await self._get_git_root(current_path)
        if not git_root:
            return self._error(500, "Not in a git repository")

        runtime, dependencies, procfile = "", "", ""

        runtime_file = f"{git_root}/runtime.txt"
        if os.path.exists(runtime_file):
            with open(runtime_file) as f:
                runtime = f.read().strip()

        dependencies_file = f"{git_root}/requirements.txt"
        if os.path.exists(dependencies_file):
            with open(dependencies_file) as f:
                dependencies = f.read().strip()

        procfile_file = f"{git_root}/Procfile"
        if os.path.exists(procfile_file):
            with open(procfile_file) as f:
                procfile = f.read().strip()

        return {
            "code": 0,
            "settings": {"runtime": runtime, "dependencies": dependencies, "procfile": procfile},
        }

    async def set_settings(self, current_path, runtime=None, dependencies=None, procfile=None):
        if not runtime and not dependencies and not procfile:
            return self._error(400, "No settings specified")

        all_remotes = await self._get_remotes(current_path)
        if not all_remotes:
            return self._error(500, "No Heroku remote in the current directory")

        git_root = await self._get_git_root(current_path)
        if not git_root:
            return self._error(500, "Not in a git repository")

        if runtime is not None:
            with open(f"{git_root}/runtime.txt", "w") as f:
                f.write(f"{runtime}\n")

        if dependencies is not None:
            with open(f"{git_root}/requirements.txt", "w") as f:
                f.write(f"{dependencies}\n")

        if procfile is not None:
            with open(f"{git_root}/Procfile", "w") as f:
                f.write(f"{procfile}\n")

        return {"code": 0}
