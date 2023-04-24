
const express = require ('express');
const cors =require("cors");
const app = express();

const videoRouter = require('./routes/videos');


app.use(cors());
app.use('/public', express.static('public'))


app.use('/videos', videoRouter)

app.listen(8080, ()=> console.log("Example appl is listening on port 8080"))