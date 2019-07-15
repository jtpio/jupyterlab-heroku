import json
import os
import subprocess
from subprocess import PIPE, Popen


class Heroku:
    def __init__(self, root_dir):
        self.root_dir = os.path.realpath(os.path.expanduser(root_dir))

    def _error(self, code, message):
        return {"code": code, "message": message}

    def _get_remotes(self, current_path):
        # TODO: handle multiple remotes / apps
        p = Popen(
            ["git", "remote", "get-url", "heroku"],
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = p.communicate()
        code = p.returncode
        if code != 0:
            return []
        return out.decode("utf-8").splitlines()

    def logs(self, current_path):
        p = Popen(
            ["heroku", "logs"],
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = p.communicate()
        code = p.returncode
        if code != 0:
            return self._error(code, err.decode("utf-8"))

        logs = out.decode("utf-8").splitlines()
        return {"code": code, "logs": logs}

    def apps(self, current_path):
        all_remotes = self._get_remotes(current_path)
        if not all_remotes:
            return {"code": 0, "apps": []}

        p = Popen(
            ["heroku", "apps", "--json"],
            stdout=PIPE,
            stderr=PIPE,
            cwd=os.path.join(self.root_dir, current_path),
        )
        out, err = p.communicate()
        code = p.returncode
        if code != 0:
            return self._error(p.returncode, err.decode("utf-8"))

        all_apps = json.loads(out.decode("utf-8"))
        remotes = set(all_remotes)
        apps = [app for app in all_apps if app["git_url"] in remotes]
        return {"code": code, "apps": apps}
