import click
import json
import os

TEMPLATE_MDX = """
import Head from "next/head";

<Head>
  <title>NumCross v{VERSION}</title>
</Head>

<article className="prose">
# Release v{VERSION}

Hello...

## New Features

- Added...

## Bug Fixes

- Fixed...

</article>
"""

def get_current_version() -> tuple[int, int, int]:
    with open("../package.json") as fin:
        data = json.load(fin)
        els = data["version"].split(".")
        return (int(els[0]), int(els[1]), int(els[2]))

def get_next_version(type: str) -> str:
    major, minor, patch = get_current_version()
    new_major = major + (1 if type == "major" else 0)
    new_minor = 0 if type == "major" else minor + 1 if type == "minor" else minor
    new_patch = patch + 1 if type == "patch" else 0
    return f"{new_major}.{new_minor}.{new_patch}"

@click.command()
@click.option('--major', is_flag=True, default=False, help='For revamps and rebrands')
@click.option('--minor', is_flag=True, default=False, help='For new features')
@click.option('--patch', is_flag=True, default=False, help='For bug fixes and adjustments')
def package(major, minor, patch):
    # Make sure params are good
    type = "major" if major else ("minor" if minor else ("patch" if patch else "error"))
    if type == "error":
        raise click.ClickException("Must specify one of --major, --minor, --patch")

    # Get the new version number
    new_version = get_next_version(type)
    if type == "major" or type == "minor":
        with open (f"../src/pages/blog/releases/{new_version}.mdx", "w") as blog_file:
            as_str = TEMPLATE_MDX.replace("{VERSION}", new_version)
            blog_file.write(as_str)
    
    # Write the new version back to package.json
    with open("../package.json", 'r') as file:
        new_package = json.load(file)
        new_package["version"] = new_version

    with open("../package.json", 'w') as file:
        json.dump(new_package, file)

    click.echo(click.style('Success! Package updated. Be sure to update the blog post if needed, and then run ship.', bold=True))

@click.command()
def ship():
    vints = get_current_version()
    version = f"{vints[0]}.{vints[1]}.{vints[2]}"

    # Make sure the project actually builds
    ret_val = os.system("cd .. && yarn build && cd infra")
    if ret_val != 0:
        raise click.ClickException("yarn build failed. Check the output above for more info.")

    # Build the docker image
    ret_val = os.system(f"cd .. && docker build -t numcross-deploy:{version} .")
    if ret_val != 0:
        raise click.ClickException("docker build failed. Check the output above for more info.")
    
    # Authenticate with aws cli
    ret_val = os.system("aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 720116267795.dkr.ecr.us-east-1.amazonaws.com")
    if ret_val != 0:
        raise click.ClickException("docker login failed. Check the output above for more info.")
    
    # Tag the image
    ret_val = os.system(f"docker tag numcross-deploy:{version} 720116267795.dkr.ecr.us-east-1.amazonaws.com/numcross_repo:latest")
    if ret_val != 0:
        raise click.ClickException("docker tag failed. Check the output above for more info.")
    
    # Push image to Amazon ECR
    ret_val = os.system(f"docker push 720116267795.dkr.ecr.us-east-1.amazonaws.com/numcross_repo:latest")
    if ret_val != 0:
        raise click.ClickException("docker push failed. Check the output above for more info.")
    
    # Force new deployment to use updated image
    ret_val = os.system("aws ecs update-service --cluster numcross-cluster --service numcross-service --force-new-deployment")
    if ret_val != 0:
        raise click.ClickException("aws ecs update-service failed. Check the output above for more info.")

    click.echo(click.style('Success! A new NumCross has been deployed.', bold=True))
