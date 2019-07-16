# jupyterlab-heroku

[![npm](https://img.shields.io/npm/v/jupyterlab-heroku.svg?style=flat-square)](https://www.npmjs.com/package/jupyterlab-heroku)
[![pypi](https://img.shields.io/pypi/v/jupyterlab-heroku.svg?style=flat-square)](https://pypi.python.org/pypi/jupyterlab-heroku)

JupyterLab extension to manage and deploy applications to Heroku.

The extension enables 1-click deployments of [voila](https://github.com/QuantStack/voila) dashboards.

![screencast](https://user-images.githubusercontent.com/591645/61288265-0d00d680-a7c7-11e9-84ff-bb3a1ef2bfc5.gif)

## Requirements

### Create an Heroku account

_If you already have an Heroku account, you can skip to the next section_.

You can create a new Heroku account by following these instructions:
https://signup.heroku.com/

### Install the heroku client

You need the `heroku` client installed on your machine to be able to deploy applications. To set it up:
https://devcenter.heroku.com/articles/getting-started-with-python#set-up

Once the setup is complete, test the installation with:

```
$ heroku --version
heroku/7.26.2 linux-x64 node-v11.14.0
```

### Login to Heroku

There are different ways to login to Heroku:

1. `heroku login` will open a new browser tab to log in with the email and password
2. create a `~/.netrc` file with the api token (see [the documentation](https://devcenter.heroku.com/articles/authentication#usage-examples) for more details)
3. set the `HEROKU_API_KEY` environment variable

To test the authentication: `heroku apps`

### Other Dependencies

This extension also requires:

- JupyterLab 1.0
- `git`

## Install

```bash
pip install jupyterlab-heroku
jupyter serverextension enable --sys-prefix --py jupyterlab_heroku
jupyter labextension install jupyterlab-heroku
```

Since Heroku uses `git` to deploy applications, it is also recommended to install the `jupyterlab-git` extension for JupyterLab:

```bash
pip install jupyterlab-git
jupyter serverextension enable --sys-prefix --py jupyterlab_git
jupyter labextension install @jupyterlab/git
```

## Contributing

### Install

```bash
# Clone the repo to your local environment
# Move to jupyterlab-heroku directory

# Create a new conda environment
conda create -n jupyterlab-heroku -c conda-forge jupyterlab nodejs

# Install the server extension
python -m pip install -e .
jupyter serverextension enable --sys-prefix --py jupyterlab_heroku

# Install dependencies
jlpm

# Build Typescript source
jlpm build

# Link your development version of the extension with JupyterLab
jupyter labextension link .

# Rebuild Typescript source after making changes
jlpm build

# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch

# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch
```

### Uninstall

```bash
jupyter labextension uninstall jupyterlab-heroku
```
