import express from 'express';
import multer from 'multer';
import { nets, detectSingleFace, detectAllFaces } from 'face-api.js';
import { canvas, faceDetectionNet, faceDetectionOptions } from '../commons';
import { goCrop } from '../commons/crop';
import AWS from 'aws-sdk'

const fs = require('fs');
const path = require('path');
const router = express.Router();
var originalImgName = '';

const storage  = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    originalImgName = file.originalname;
    cb(null, originalImgName);
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
  console.log('|                     |')
  console.log('|        Start!       |')
  console.log('|                     |')
  console.log('-----------------------')

  console.log('-----------------------')
  console.log('|                     |')
  console.log('|      File list > '+fileList)
  console.log('|                     |')
  console.log('-----------------------')

  let resultList = [];

  const imgCropPromise = fileList.map(async (fileName) => {
      const img_path = './uploads/' + fileName;
    
      const img = await canvas.loadImage(img_path);
    
      console.log('-----------------------')
      console.log('|                     |')
      console.log('|     Get LandMark > '+ img_path)
      console.log('|                     |')
      console.log('-----------------------')
      const landmarkResult = (await detectSingleFace(img, faceDetectionOptions).withFaceLandmarks());

      if(landmarkResult) {
        console.log('-----------------------')
        console.log('|                     |')
        console.log('|    LandMark Success > '+ img_path)
        console.log('|                     |')
        console.log('-----------------------')
        let topOffset = Math.floor(landmarkResult.alignedRect.box.y + landmarkResult.alignedRect.box.height);
        let originImgWidth = landmarkResult.alignedRect.imageDims.width;
        let originImgHeight = landmarkResult.alignedRect.imageDims.height;
      
        console.log('-----------------------')
        console.log('|                     |')
        console.log('|        Go Crop      |')
        console.log('|                     |')
        console.log('-----------------------')
        const cropRes = await goCrop(topOffset,img_path, originImgWidth, originImgHeight);
  
        resultList.push({
          origin:img_path,
          result: './crop'+ cropRes.path.split('/crop')[1]
        });
      } else {
        console.log('-----------------------')
        console.log('|                     |')
        console.log('|    LandMark Fail > '+ img_path)
        console.log('|                     |')
        console.log('-----------------------')
        resultList.push({
          origin:img_path,
          result:'fail'
        });
      }
    
  });
  const promiseResult = await Promise.all(imgCropPromise);
  console.log(resultList)
  if (promiseResult) return resultList;

  return 'not found';
};


const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

const awsUpload = async (path) => {
  const blob = fs.readFileSync(path)

  let imgUploadRes = await s3.upload({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: path, /// aws directory location & filename
    Body: blob,
  }).promise();

  imgUploadRes.then( function(data) {
    return 200;
  }).catch( function(err) {
    return 404;
  });


}

router.post('/', uploadWithOriginalFilename.array('image',10), async (req, res, next) => {
  try {
    const data = await run();
    res.status(200).json(data);
    console.log('-----------------------')
    console.log('|                     |')
    console.log('|      Finish 200     |')
    console.log('|                     |')
    console.log('-----------------------')
  } catch (err) {
    console.log('-----------------------')
    console.log('|                     |')
    console.log('|       Fail 404      |')
    console.log('|                     |')
    console.log('-----------------------')
    next(err);
  }
});

export default router;
