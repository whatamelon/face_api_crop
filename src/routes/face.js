import express from 'express';
import multer from 'multer';
import { nets, detectSingleFace } from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions } from '../commons';
import { successLandMark,successBehind,noLandMark } from '../commons/choiceCrop';

const fs = require('fs');
const path = require('path');
const router = express.Router();

const storage  = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadWithOriginalFilename = multer({ storage });

const run = async () => {
  const MODEL_URL = './models/';

  await faceDetectionNet.loadFromDisk(MODEL_URL);
  await nets.faceLandmark68Net.loadFromDisk(MODEL_URL);

  let fileList = [];
  const uploadFolder = path.resolve('./uploads');

  fs.readdirSync(uploadFolder).forEach(file => {
    fileList.push(file);
  });

  console.log('-----------------------')
  console.log('|        Start!   > ', fileList)
  console.log('-----------------------')

  let resultList = [];

  const promiseResult = await Promise.all(fileList.reduce(async ( promise, fileName, index ) => {
    const img_path = './uploads/' + fileName;
    const img = await canvas.loadImage(img_path);

    console.log('-----------------------')
    console.log('|     Get LandMark > '+ img_path)
    console.log('-----------------------')

    const landmarkResult = (await detectSingleFace(img, faceDetectionOptions).withFaceLandmarks());

    if(landmarkResult) {

      resultList.push(await successLandMark(img_path,landmarkResult, index));

    } else if(landmarkResult == undefined && img_path.split('_')[1].includes('4') == true) {

      resultList.push(await successBehind(img_path));

    } else {
      resultList.push(noLandMark(img_path));
    }
  }));

  if (promiseResult) return resultList;

  // const imgCropPromise = fileList.map(async (fileName) => {

  //     const img_path = './uploads/' + fileName;
  //     const img = await canvas.loadImage(img_path);

  //     console.log('-----------------------')
  //     console.log('|     Get LandMark > '+ img_path)
  //     console.log('-----------------------')

  //     const landmarkResult = (await detectSingleFace(img, faceDetectionOptions).withFaceLandmarks());

  //     if(landmarkResult) {

  //       resultList.push(await successLandMark(img_path,landmarkResult));

  //     } else if(landmarkResult == undefined && img_path.split('_')[1].includes('4') == true) {

  //       resultList.push(await successBehind(img_path));

  //     } else {
  //       resultList.push(noLandMark(img_path));
  //     }
  // });

  // const promiseResult = await Promise.all(imgCropPromise);

  // if (promiseResult) return resultList;

  return 'not found';
};


router.post('/', uploadWithOriginalFilename.array('image',10), async (req, res, next) => {
  try {
    const data = await run();
    res.status(200).json(data);
    console.log('-----------------------')
    console.log('|      Finish 200     |')
    console.log('-----------------------')
  } catch (err) {
    console.log('-----------------------')
    console.log('|       Fail 404      |')
    console.log('-----------------------')
    next(err);
  }
});

export default router;
