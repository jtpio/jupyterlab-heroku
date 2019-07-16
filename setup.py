import os
import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

here = os.path.dirname(os.path.abspath(__file__))
version_ns = {}
with open(os.path.join(here, "jupyterlab_heroku", "_version.py")) as f:
    exec(f.read(), {}, version_ns)

setuptools.setup(
    name="jupyterlab_heroku",
    version=version_ns["__version__"],
    author="Jeremy Tuloup",
    description="A server extension for the JupyterLab Heroku extension",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=["jupyterlab"],
    package_data={"jupyterlab_heroku": ["*"]},
)
