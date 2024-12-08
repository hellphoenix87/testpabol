# Shared Functions.

This directory includes all the methods and classes shared by both frontend and backend.

## Video Creator [(Notion)](https://www.notion.so/Video-Creator-6e6afad0297746a5be0dc614f2d4d533)

Video creator is a class used to generate video on the browser or Node.js controlling all aspects using options property.

### How to use

You can use the video creator by initiating the `VideoCreator` class call the `generate` method

```js
import { VideoCreator } from "@shared/videoCreator";

const videoCreator = new VideoCreator(options);
await videoCreator.generate(scenesList);

```

**Note**: you can use the same instance multiple times by using `updateOptions` and re-run `generate` method to

```js
videoCreator.updateOptions(newOptions);
await videoCreator.generate(scenesList);
```

**options**

|option                |environment |description                                     |required |
|----------------------|:----------:|-----------------------------------------------:|--------:|
|part                  |both        |used to render only one scene as a vidoe        |false    |
|firebaseApp           |browser     |the browser firebase app needs to be set        |true     |
|shot_default_duration |both        |the minimum shot duration                       |false    |
|fps                   |both        |the number of frames per second                 |false    |
|cachedDownloads       |browser     |used in browser to keep caching the downloads   |false    |
|canvasRef             |browser     |the canvas used to preview the video in         |true     |
|percentageHandler     |both        |handler method triggered fir any change happen  |false    |
|volume                |both        |the audio volumes                               |false    |
|fade                  |both        |the fading time                                 |false    |
|zoomIntensity         |both        |the maximum zooming intensity                   |false    |




After initializing the instance and generate the video you can use the methods used to preview/generate the video


```js
// preview methods, used in the browser only
videoCreator.play();
videoCreator.stop();
videoCreator.invokeShot(shotIndex);

// preview properties, used in the browser only
videoCreator.isPlaying;

// create/bake video methods, used in the node app
await videCreator.createFile();

// public properties
videoCreator.duration
videoCreator.isReady
```

### The code structure

[Check Notion](https://www.notion.so/Video-Creator-6e6afad0297746a5be0dc614f2d4d533)

### FFMPEG

[Check FFMPEG Documentation](https://ffmpeg.org/ffmpeg.html)


