import express from 'express';
import { nets, detectSingleFace } from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions } from '../commons';
import { awsUploadImg } from '../commons/aws';
import { successLandMark,successBehind,noLandMark } from '../commons/choiceCrop';
import { downloadImages } from '../commons/downloadImage';

const fs = require('fs');
const path = require('path');

const router = express.Router();

const run = async () => {
  const MODEL_URL = './models/';

  await faceDetectionNet.loadFromDisk(MODEL_URL);
  await nets.faceLandmark68Net.loadFromDisk(MODEL_URL);

  let fileList = [];
  let resultList = [];
  const uploadFolder = path.resolve('./uploads');


  fs.readdirSync(uploadFolder).forEach(file => {
    fileList.push(file);
  });

  console.log('-----------------------')
  console.log('|        Start!   ', fileList)
  console.log('-----------------------')


  const imgCropPromise = fileList.map(async (fileName) => {

      const img_path = './uploads/' + fileName;
      const img = await canvas.loadImage(img_path);

      const landmarkResult = (await detectSingleFace(img, faceDetectionOptions).withFaceLandmarks());

      if(landmarkResult) {

        resultList.push(await successLandMark(img_path,landmarkResult));

      } else if(landmarkResult == undefined && img_path.split('_')[1].includes('4') == true) {

        resultList.push(await successBehind(img_path));

      } else {
        resultList.push(noLandMark(img_path));
      }
  });

  const promiseResult = await Promise.all(imgCropPromise);

  if (promiseResult) return {
    status:200,
    result:resultList
  };
  else return {
    status:404,
    result:[]
  };
};

router.post('/', async (req, res, next) => {
  try {
    const downres = await downloadImages(req.body.urls.split(':::'));
    if(downres == 200) {
      console.log('-----------------------')
      console.log('|   DownLoad Succes   |')
      console.log('-----------------------')
      setTimeout(async () => {
        const data = await run();
        if(data.status == 200) {
          const awsres = await awsUploadImg(data.resultList);
          if(awsres.status == 200) {
            res.status(awsres.status).json(awsres.result);
            console.log('-----------------------')
            console.log('|      Finish 200     |')
            console.log('-----------------------')
          }
        }

      }, 5000);
    }
  } catch (err) {
    console.log('-----------------------')
    console.log('|       Fail 404      |')
    console.log('-----------------------')
    next(err);
  }
});

export default router;