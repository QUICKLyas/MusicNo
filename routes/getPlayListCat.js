var express = require("express");
var router = express.Router();
const { spawn } = require("child_process");
var fs = require("fs");
const cors = require('cors')
const connectMusicDB = require("../components/mongoConnection");
const runPython = require("../components/runPython");

router.use(express.json())
router.use(express.urlencoded({ extended: false }))
router.use(cors())

// 模糊查询歌曲名
router.post("/", (req, res, next) => {
  // 判断POST请求是否包含请求体
  if (Object.keys(req.body).length) {
    const body = req.body;
    fs.writeFileSync("music_cat.json", JSON.stringify(body));
    runPython("./pyprog/mongoClassify.py", () => {
      const data = fs.readFileSync('./music_playlist_data.txt', { encoding: 'utf-8' })
      const music_result_arr = data.split('\n')
      let music_result_json = []
      music_result_arr.map(item => {
        music_result_json.push(JSON.parse(item))
      })
      // 发送JSON
      res.send({ success: true, result: music_result_json })
      fs.unlink('./music_playlist_data.txt', (err) => {
        if (err) throw err;
      });
    })
  } else {
    res.send({ errmsg: "request Body为空" }).status(404);
    next();
  }
});
module.exports = router;
