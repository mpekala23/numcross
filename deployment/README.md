# How to Push a New Version

It's been awhile since I worked on the terraform stuff but now we're interested in going live. I'm documenting the process of building and pushing a new version so that when we want to do this again in the future, we can.

# Docker Stuff

## Building the Image

To build the image, run `docker build -t numcross-deploy .`

It's good practice to make sure that the image is working as expected by running

```
docker run -p 3001:3001 -d numcross-deploy
```

and playing around with it locally. This is the image that will be run on EC2 so whatever behavior you get here is what you'll get in the live app.

## Pushing to Amazon Elastic Container Registry

### Authenticating to Docker

The first step is to make sure that you are signed in to the AWS CLI with an account that has proper credentials. If you aren't, follow [this](https://docs.aws.amazon.com/powershell/latest/userguide/pstools-appendix-sign-up.html).

Then, the easiest way to do it is to go to the repo and hit "view push commands". Then just follow along. Will look something like:

```
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 720116267795.dkr.ecr.us-east-1.amazonaws.com
```

```
docker tag numcross_repo:latest 720116267795.dkr.ecr.us-east-1.amazonaws.com/numcross_repo:latest
```

```
docker push 720116267795.dkr.ecr.us-east-1.amazonaws.com/numcross_repo:latest
```

# Terraform Stuff
