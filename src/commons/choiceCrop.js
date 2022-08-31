import { goCrop } from './crop';

const fs = require('fs');
const path = require('path');
const probe = require('probe-image-size');

var luckychouetteFirstImgTop = 0;


var noLandMark = function(img_path){
    console.log('-----------------------')
    console.log('|                     |')
    console.log('|    LandMark Fail > '+ img_path)
    console.log('|                     |')
    console.log('-----------------------')

    return {
        origin:img_path,
        result:'fail'
    }
}




var successLandMark = async function(img_path,landmarkResult, index) {

    console.log('-----------------------')
    console.log('|                     |')
    console.log('|    LandMark Success > '+ img_path)
    console.log('|                     |')
    console.log('-----------------------')
    let topOffset = Math.floor(landmarkResult.alignedRect.box.y + landmarkResult.alignedRect.box.height);
    let originImgWidth = landmarkResult.alignedRect.imageDims.width;
    let originImgHeight = landmarkResult.alignedRect.imageDims.height;

    if(index == 0) {
      console.log('index = 0 , top offset : ',topOffset)
      luckychouetteFirstImgTop = topOffset;
    }

    console.log('-----------------------')
    console.log('|                     |')
    console.log('|        Go Crop      |')
    console.log('|                     |')
    console.log('-----------------------')

    const cropRes = await goCrop(topOffset,img_path, originImgWidth, originImgHeight);

    return {
        origin:img_path,
        result: './crop'+ cropRes.path.split('/crop')[1]
    }
}




var successBehind = async function(img_path) {

    console.log('-----------------------')
    console.log('|                     |')
    console.log('|    LandMark Fail but LL4 > '+ img_path)
    console.log('|                     |')
    console.log('-----------------------')

    const imgPathResolve = path.resolve(img_path);

    let data = fs.readFileSync(imgPathResolve);
    console.log(luckychouetteFirstImgTop)
    console.log(probe.sync(data).width)
    console.log(probe.sync(data).height)

    const cropRes = await goCrop(luckychouetteFirstImgTop,img_path, probe.sync(data).width, probe.sync(data).height);
    return {
        origin:img_path,
        result: './crop'+ cropRes.path.split('/crop')[1]
    }
}


export { successBehind, noLandMark, successLandMark }