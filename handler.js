const dotenv = require("dotenv");
dotenv.config();
const { TwitterClient } = require("twitter-api-client");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

const express = require("express");
const app = express();

function getVariable(name) {
  if (fs.existsSync(`${__dirname}/../secrets.json`)) {
    return require(`${__dirname}/../secrets.json`)[name];
  }
  return process.env[name];
}

const twitterClient = new TwitterClient({
  apiKey: getVariable("TWITTER_API_KEY"),
  apiSecret: getVariable("TWITTER_API_SECRET_KEY"),
  accessToken: getVariable("TWITTER_API_ACCESS_TOKEN"),
  accessTokenSecret: getVariable("TWITTER_API_ACCESS_SECRET"),
});

async function processImage(url, imagePath) {
  await axios({
    url,
    responseType: "arraybuffer",
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        const rounded_corners = new Buffer.from(
          '<svg><rect x="0" y="0" width="100" height="100" rx="50" ry="50"/></svg>'
        );
        resolve(
          sharp(response.data)
            .resize(100, 100)
            .composite([
              {
                input: rounded_corners,
                blend: "dest-in",
              },
            ])
            .png()
            .toFile(imagePath)
        );
      })
  );
}

async function fetchFollowers(f_count) {
  var currentTime = new Date();

  var currentOffset = currentTime.getTimezoneOffset();

  var ISTOffset = 330; // IST offset UTC +5:30

  var ISTTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );

  // ISTTime now represents the time in IST coordinates

  var hoursIST = ISTTime.getHours();
  var minutesIST = ("0" + ISTTime.getMinutes()).slice(-2);
  var secIST = ISTTime.getSeconds();
  // var dateIST = ISTTime.getDate();
  var dateIST = ISTTime.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  console.log(
    "🛠️ Latest upload attempt made at " +
      dateIST +
      " @ " +
      hoursIST +
      ":" +
      minutesIST +
      ":" +
      secIST
  );
  const follows = await twitterClient.accountsAndUsers.followersList({
    count: f_count,
  });

  follows.users.forEach((follower) => {
    console.log(follower.screen_name);
  });

  const images = [];
  let count = 0;

  const fetchImages = new Promise((resolve, reject) => {
    follows.users.forEach((follower, idx, arr) => {
      processImage(
        follower.profile_image_url_https,
        `${follower.screen_name}.png`
      ).then(() => {
        const followerImage = {
          input: `${follower.screen_name}.png`,
          top: 260,
          left: parseInt(`${400 + 150 * idx}`),
        };
        images.push(followerImage);
        count++;
        if (count == arr.length) resolve();
      });
    });
  });

  fetchImages.then(() => {
    draw(images);
  });
}

async function draw(images) {
  try {
    await sharp("assets/twitter-banner.png").composite(images).toFile("banner.png");
    upload(images);
  } catch (err) {
    console.log(err);
  }
}

async function upload(files) {
  try {
    const base64 = await fs.readFileSync("banner.png", {
      encoding: "base64",
    });
    await twitterClient.accountsAndUsers
      .accountUpdateProfileBanner({
        banner: base64,
      })
      .then(() => {
        console.log("✅ Uploaded to Twitter");
        delete_files(files);
      });
  } catch (error) {
    console.log(error);
  }
}

async function delete_files(files) {
  try {
    files.forEach((file) => {
      if (file.input.includes(".png")) {
        fs.unlinkSync(file.input);
      }
    });
    console.log("✅ Flushed file buffer");
  } catch (err) {
    console.error(err);
  }
}

// fetchFollowers(5);
// setInterval(() => {
//   fetchFollowers(5);
// }, 600000); // 10 mins

module.exports.lol = async () => {
  try {
    await fetchFollowers(5);
  } catch (error) {
    console.info(`!!! Could not update banner: ${error}`);
  }
};

if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  this.lol();
}