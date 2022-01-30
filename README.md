# Dynamic Header

A serverless app that pulls data about latest Twitter followers to draw and upload a header to the account after a fixed interval. Uses AWS CloudWatch, AWS Lambda, and NodeJS.

![code-flow]()

 ### Tools
- Node v17.4.0
- AWS Lambda
- Twitter API

### Usage
- Create a `secrets.json` containing Twitter API secrets and place at the root of the project.
- Set AWS access token and secret as environment variables.
- Execute `deploy.sh` to deploy the app and check the logs for any errors.

### Repository Structure and Branches
Pushing features and changes follows a fixed step-wise process.
- `dev` - Active development happens in the branch and all the running changes are pushed to this branch. Consider this branch as the nightly builds. **Note: Builds of this branch may/may not pass tests, compile or maybe highly unstable**

- `version` - Aggregated commits are merged to this branch and represents a working version of the project. Represents a sub-version change (v1.1.2 → v1.1.3). No direct commits are to be made to this branch! **Note: Builds of this branch may/may not pass tests and work as expected but may compile just fine.**

- `main` - Release branch. Includes the code that is currently live in production and is tested fully. Represents a sub-version change (v1.1.2 → v1.2.0). No direct commits are to be made to this branch! **Note: Builds of this branch pass all the tests and are live. DO NOT MAKE ANY CHANGES DIRECTLY!**

- `hotfix-<issue>` (Optional) - Temporary branch that contains fixes to urgent issues and can be issued as a patch. Can be directly merged into `main` if the build passes all the tests. **Note: Delete the branch after the patch has been merged.**

### Modules
- dotenv v10.0.0
- nodemon v2.0.15
- serverless v3.0.1
- sharp v0.29.3
- twitter-api-client v1.4.0

### References
- Medium
  - [How To Build a Self-Updating Twitter Banner With Dynamic Content](https://betterprogramming.pub/how-to-build-a-self-updating-twitter-banner-with-dynamic-content-7c3fedcfca25)
  - [Create a real-time Twitter banner!](https://blog.deveshb.me/create-a-real-time-twitter-banner)
- DEV
  - [How to Dynamically Update Twitter Cover Image to Show Latest Followers Using PHP GD and TwitterOAuth](https://dev.to/erikaheidi/how-to-dynamically-update-twitter-cover-image-to-show-latest-followers-using-php-gd-and-twitteroauth-62n)
- AWS User Docs
  - [AWS SAM template for a EventBridge](https://docs.aws.amazon.com/lambda/latest/dg/with-scheduledevents-example-use-app-spec.html)
  - [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/index.html)
  - [What is AWS Lambda?](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
  - [AWS Lambda Features](https://aws.amazon.com/lambda/features/)
- Serverless [Docs](https://www.serverless.com/framework/docs/providers/aws/events/schedule)
- Khushboo Verma's [Twitter Banner](https://twitter.com/khushbooverma_)

#### Support Free and Open Source Software ❤
