import os


class Heroku:
    def __init__(self, root_dir):
        self.root_dir = os.path.realpath(os.path.expanduser(root_dir))

    def logs(s):
        return ["a", "b", "c"]
