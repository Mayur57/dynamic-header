const dotenv = require("dotenv");
dotenv.config();
const { TwitterClient } = require("twitter-api-client");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");

const twitterClient = new TwitterClient({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessTokenSecret: process.env.ACCESS_SECRET,
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
  const follows = await twitterClient.accountsAndUsers.followersList({
    count: f_count,
  });
  console.log(follows.screen_name);

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
    console.log(parseInt(hour))
    const welcomeMsgs = [
      "Good Morning!",
      "Good Afternoon!",
      "Good Evening!",
      "Go to sleep, bruh",
    ];
    let welcomeTxt = "";

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
        console.log("Upload to Twitter done");
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
        console.log("File removed");
      }
    });
  } catch (err) {
    console.error(err);
  }
}

fetchFollowers(5);
setInterval(() => {
  fetchFollowers(5);
}, 60000);

// http
//   .createServer(function (req, res) {
//     res.send("===================> running\n");
//   })
//   .listen(process.env.PORT || 6969);