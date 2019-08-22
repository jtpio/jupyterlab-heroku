# Making a new release

## Getting a clean environment

Creating a new environment can help avoid pushing local changes and any extra tag.

```bash
conda create -n jupyterlab-heroku-release -c conda-forge twine nodejs
conda activate jupyterlab-heroku-release
```

Alternatively, the local repository can be cleaned with:

```bash
git clean -fdx
```

## Releasing on npm

1. Update [package.json](./package.json) with the new version.
2. `npm login`
3. `npm publish`

## Releasing on PyPI

Make sure the `dist/` folder is empty.

1. Update [jupyterlab_heroku/\_version.py](./jupyterlab_heroku/_version.py) with the new version.
2. `python setup.py sdist bdist_wheel`
3. `twine upload dist/*`

## Releasing on conda-forge

TODO

## Committing and tagging

Commit the changes, create a new release tag where `x.y.z` denotes the new version:

```bash
git checkout master
git add jupyterlab_heroku/_version.py package.json
git commit -m "Release x.y.z"
git tag x.y.z
git push origin master x.y.z
```
