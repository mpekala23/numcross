# Infrastructure

The scripts in this folder automate the release process.

## Setup

These scripts depend on the [Click](https://click.palletsprojects.com/en/7.x/) package for Python.

You will need to activate a virtual environment, then run `pip install --editable .` from this folder. Then you should have access to the commands (while the venv is active) and be able to change them.

## Usage

When ready to release, first run

```
package [--patch] [--minor] [--major]
```

where only one of the flags will be provided.

NOTE: If you are releasing a `minor` or `major` patch (i.e. changing one or both of the first two numbers in `x.y.z`) a blog post will be created in the form of an `.mdx` file in `src/pages/blog/releases/x.y.z.mdx`. YOU MUST GO IN AND EDIT THIS POST BEFORE YOU SHIP THE RELEASE. It will go live on the website and should tell our users what's new in this version.

Once the above succeeds (and you've written a blog post if needed) then you can simply run

```
ship
```

to check the build of the app, build the docker image, push it to AWS, and then trigger a redeployment. Voila!
