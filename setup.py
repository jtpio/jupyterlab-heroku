import setuptools

with open("README.md", "r") as fh:
    long_description = fh.read()

setuptools.setup(
    name='jupyterlab_heroku',
    version='0.1.0',
    author='Jeremy Tuloup',
    description="A server extension for the JupyterLab Voila Heroku extension",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=setuptools.find_packages(),
    install_requires=[
        'jupyterlab'
    ],
    package_data={'jupyterlab_heroku': ['*']},
)
