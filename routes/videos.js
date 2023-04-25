const express = require("express");
const fs = require("node:fs");
const router = express.Router()
const { v4 } = require("uuid");
const path = require('path')

router.use(express.json());

router.use('/public', express.static(path.join(__dirname, 'public')))

//get the video list

router.get('/', (req, res) => {
    const dataEl = getVideo();
    const smallVideo = dataEl.map(video => {
        return {
            id: video.id,
            title: video.title,
            channel: video.channel,
            image: video.image,
        }
    })
    res.json(smallVideo)
})

//displaying video

router.get('/:id', (req, res) => {
    const id = req.params.id
    const dataFile = fs.readFileSync("./data/video-detail.json");
    const data = JSON.parse(dataFile);
    const video = data.find(item => item.id === id)
    res.json(video)
})

//posting comments starts here

router.post("/:id/comments", (req, res, next) => {
    const dataEl = getVideo();

    const { comment, id } = req.body;

    const newComment = {
        id: v4(),
        name: "Tom Cruise",
        comment: comment,
        likes: 0,
        timestamp: new Date().getTime()
    };

    // initially, I tried the const findVideo = dataEl.find(video=>video.id===id)
    // but cannot get the id successfully. Don't know why. 
    // The console.log result shows that .find method returned index of -1
    //tried the .findIndex(), it solved the problem

    const findIndex = dataEl.findIndex(video => video.id === id)
    dataEl[findIndex].comments.unshift(newComment)

    fs.writeFileSync("./data/video-detail.json", JSON.stringify(dataEl));

    res.send("created");
});


//posting videos starts here

router.post("/", validator, (req, res) => {
    const videoDetailsDataFile = fs.readFileSync("./data/video-detail.json");
    const videoDetailsData = JSON.parse(videoDetailsDataFile);

    const { title, description } = req.body;

    const newVideoDetail = {
        id: v4(),
        title: title,
        channel: 'Daniel Cao',
        image: "http://localhost:8080/public/upload-img.jpg",
        description: description,
        views: "952",
        likes: "0",
        duration: "1:00",
        video: "",
        timestamp: new Date(),
        comments: [
            {
                "id": v4(),
                "name": "Mike Steve",
                "comment": "Such a wonder trip. Wish I can ride along with you.",
                "likes": 6,
                "timestamp": 1631816492000
            },
            {
                "id": v4(),
                "name": "Joe Smith",
                "comment": "Can't say I'm not considering taking my bike out after I watched your vlog. That was some amazing get away there.",
                "likes": 1,
                "timestamp": 1631799181000
            },
            {
                "id": v4(),
                "name": "Eddie Wang",
                "comment": "I love riding bicycle. I used to have one and rode for years until I got my injury. Now I really need to loose some weight. And maybe it's time to start the spring exercising.",
                "likes": 0,
                "timestamp": 1631716921000
            }
        ]
    };

    videoDetailsData.push(newVideoDetail);

    fs.writeFileSync(
        "./data/video-detail.json",
        JSON.stringify(videoDetailsData)
    );

    res.send("created");
});


//put likes start from here

router.put("/:id/comments/:commentId/like", (req, res) => {
    const videoDetailsDataFile = fs.readFileSync("./data/video-detail.json");
    const videoDetailsData = JSON.parse(videoDetailsDataFile);
  
    const { id, commentId } = req.params;
    // Find the video object with the matching videoId
    const videoIndex = videoDetailsData.findIndex((video) => video.id === id);
  
    if (videoIndex === -1) {
      res.status(404).json({ message: "Video not found" });
      return;
    }
  
    // Find the comment object with the matching commentId
    const commentIndex = videoDetailsData[videoIndex].comments.findIndex((comment) => comment.id === commentId);
  
    if (commentIndex === -1) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
  
    // Increment the like count of the comment
    videoDetailsData[videoIndex].comments[commentIndex].likes += 1;
  
    // Save the updated data to the video-detail.json file
    fs.writeFileSync("./data/video-detail.json", JSON.stringify(videoDetailsData));
  
    // Return the updated video object
    res.status(200).json(videoDetailsData[videoIndex]);
  });




//delete comments starts from here

router.delete("/:id/comments/:commentId", (req, res) => {
    const videoDetailsDataFile = fs.readFileSync("./data/video-detail.json");
    const videoDetailsData = JSON.parse(videoDetailsDataFile);
  
    const { id, commentId } = req.params;
    console.log(id, commentId)
    // Find the video object with the matching videoId
    const videoIndex = videoDetailsData.findIndex((video) => video.id === id);
  
    if (videoIndex === -1) {
      res.status(404).json({ message: "Video not found" });
      return;
    }
  
    // Find the comment object with the matching commentId
    const commentIndex = videoDetailsData[videoIndex].comments.findIndex((comment) => comment.id === commentId);
  
    if (commentIndex === -1) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }
  
    // Remove the comment from the comments array
    videoDetailsData[videoIndex].comments.splice(commentIndex, 1);
  
    // Save the updated data to the video-detail.json file
    fs.writeFileSync("./data/video-detail.json", JSON.stringify(videoDetailsData));
  
    // Return the updated video object
    res.status(200).json(videoDetailsData[videoIndex]);
  });


//some utility functions here

function getVideo() {
    const dataFile = fs.readFileSync("./data/video-detail.json");
    const data = JSON.parse(dataFile);
    return data;
}

function validator(req, res, next) {
    const { title, description } = req.body;
    if (!title || !description) {
        res.status(400).send("need an author and content");
    } else {
        next();
    }
}

module.exports = router