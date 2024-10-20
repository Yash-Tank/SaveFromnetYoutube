const express = require('express');
const cors = require("cors")
const ytdl = require("@distube/ytdl-core");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve the static HTML page (assuming you have it)
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Route to download the video
app.post('/download', async (req, res) => {
    const { videoUrl } = req.body; 
    const trimmedUrl = videoUrl.split('?')[0];

    if (!trimmedUrl || !ytdl.validateURL(trimmedUrl)) {
        return res.json({ success: false, error: 'Invalid YouTube URL' });
    }

    try {
        const videoId = ytdl.getURLVideoID(trimmedUrl);
        const outputPath = path.join(__dirname, 'downloads', `${videoId}.mp4`);

        // Download the video and save to 'downloads' folder
        ytdl(trimmedUrl, { quality: 'highest' })
            .pipe(fs.createWriteStream(outputPath))
            .on('finish', () => {
                const downloadLink = `/downloads/${videoId}.mp4`;
                res.json({ success: true, downloadLink });
            })
            .on('error', (err) => {
                res.json({ success: false, error: err.message });
            });

            ytdl.getBasicInfo(videoUrl).then(info => {
            console.log(info.title);
});
    } catch (err) {
        console.log(err)
        res.json({ success: false, error: 'Failed to download video' });
    }
});

// app.post('/downloads', async (req, res) => {
//     const { videoUrl } = req.body; 

//     if (!videoUrl || !ytdl.validateURL(videoUrl)) {
//         return res.json({ success: false, error: 'Invalid YouTube URL' });
//     }

//     try {
//         // Set the response headers to force a download
//         res.header('Content-Disposition', 'attachment; filename="video.mp4"');

//         // Stream the video directly to the response
//         ytdl(videoUrl, { quality: 'highest' }).pipe(res);

//         // Optionally, log the video title for reference
//         const info = await ytdl.getBasicInfo(videoUrl);
//         console.log('Downloading:', info.title);
        
//     } catch (err) {
//         console.error(err);
//         res.json({ success: false, error: 'Failed to download video' });
//     }
// });


// // Route to get basic video info (title, etc.)
// app.get('/info/basic', async (req, res) => {
//     const videoUrl = req.query.url;

//     if (!videoUrl || !ytdl.validateURL(videoUrl)) {
//         return res.json({ success: false, error: 'Invalid YouTube URL' });
//     }

//     try {
//         const info = await ytdl.getBasicInfo(videoUrl);
//         res.json({ success: true, title: info.videoDetails.title, author: info.videoDetails.author.name });
//     } catch (err) {
//         res.json({ success: false, error: 'Failed to retrieve video info' });
//     }
// });

// // Route to get full video info (with formats)
// app.get('/info/full', async (req, res) => {
//     const videoUrl = req.query.url;

//     if (!videoUrl || !ytdl.validateURL(videoUrl)) {
//         return res.json({ success: false, error: 'Invalid YouTube URL' });
//     }

//     try {
//         const info = await ytdl.getInfo(videoUrl);
//         res.json({ success: true, formats: info.formats });
//     } catch (err) {
//         res.json({ success: false, error: 'Failed to retrieve video info with formats' });
//     }
// });

// Serve the downloaded files
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});