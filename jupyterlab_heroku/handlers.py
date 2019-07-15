import json


from notebook.utils import url_path_join as ujoin
from notebook.base.handlers import APIHandler


class HerokuHandler(APIHandler):
    """
    Top-level parent class.
    """

    @property
    def heroku(self):
        return self.settings["heroku"]

    @property
    def current_path(self):
        return self.get_json_body()["current_path"]


class HerokuLogs(HerokuHandler):
    def post(self):
        result = self.heroku.logs(self.current_path)
        self.finish(json.dumps(result))


def setup_handlers(web_app):
    """
    Setups the handlers for interacting with the heroku client.
    """

    heroku_handlers = [
        ("/heroku/logs", HerokuLogs),
    ]

    base_url = web_app.settings["base_url"]
    heroku_handlers = [(ujoin(base_url, path), handler) for path, handler in heroku_handlers]
    web_app.add_handlers(".*", heroku_handlers)
