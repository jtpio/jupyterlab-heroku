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
