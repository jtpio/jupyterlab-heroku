from ._version import __version__

from jupyterlab_heroku.handlers import setup_handlers
from jupyterlab_heroku.heroku import Heroku


def _jupyter_server_extension_paths():
    return [{"module": "jupyterlab_heroku"}]


def load_jupyter_server_extension(nb_app):
    heroku = Heroku(nb_app.web_app.settings.get("server_root_dir"))
    nb_app.web_app.settings["heroku"] = heroku
    setup_handlers(nb_app.web_app)
