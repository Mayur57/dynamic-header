const dotenv = require("dotenv");
dotenv.config();
const { TwitterClient } = require("twitter-api-client");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

const express = require("express");
const app = express();
const port = 6969;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

const twitterClient = new TwitterClient({
  apiKey: "jOR227HJmGB5aHexJMNLCebBQ",
  apiSecret: "oCjzXe4G5eDw1aNyNWsyLuYWEcma14XoaZZNWEOJ2lOJOlKwV1",
  accessToken: "749528490274353152-ytsi1bZgc7tKk44DG9Pmh5FUPAwhNPd",
  accessTokenSecret: 'AkHEl6PXpfg76obIC2keBztWcdwAKcPXp8lhJzduXJzJD',
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

async function makeText(w, h, t) {
  try {
    const svg = `
    <svg width="${w}" height="${h}">
    <style>
    .text {
      font-size: 64px;
      fill: #fff;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
    }
    </style>
    <text x="0%" y="50%" text-anchor="start" class="text">${t}</text>
    </svg>
    `;
    const svgBuffer = Buffer.from(svg);
    return svgBuffer;
  } catch (err) {
    console.log(err);
  }
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
console.log("🛠️ Latest upload attempt made at " + dateIST + " @ " + hoursIST + ":" + minutesIST+":"+secIST);
  const follows = await twitterClient.accountsAndUsers.followersList({
    count: f_count,
  });

  follows.users.forEach((follower) => {
    console.log(follower.screen_name)
  })

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
          top: 360,
          left: parseInt(`${870 + 120 * idx}`),
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
    const d = new Date();
    let hour = d.getHours();
    // console.log(parseInt(hour));
    const welcomeMsgs = [
      "Good Morning!",
      "Good Afternoon!",
      "Good Evening!",
      "Go to sleep, bruh",
    ];
    
    let welcomeTxt = "";
    hour = hour + 5;
    console.log(parseInt(hour))
    if (hour < 7) welcomeTxt += welcomeMsgs[3];
    else if (hour < 12) welcomeTxt += welcomeMsgs[0];
    else if (hour < 17) welcomeTxt += welcomeMsgs[1];
    else welcomeTxt = welcomeTxt += welcomeMsgs[2];

    const svgGreet = await makeText(540, 100, welcomeTxt);
    images.push({
      input: svgGreet,
      top: 52,
      left: 52,
    });

    await sharp("twitter-banner.png").composite(images).toFile("banner.png");

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

fetchFollowers(5);
setInterval(() => {
  fetchFollowers(5);
}, 120000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});