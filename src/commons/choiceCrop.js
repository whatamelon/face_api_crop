import { goCrop } from './crop';

const fs = require('fs');
const path = require('path');
const probe = require('probe-image-size');


var noLandMark = function(img_path){
    console.log('-----------------------')
    console.log('|    LandMark Fail > '+ img_path)
    console.log('-----------------------')

    return {
        origin:img_path,
        result:'fail'
    }
}




var successLandMark = async function(img_path,landmarkResult) {

    console.log('-----------------------')
    console.log('|    LandMark Success > '+ img_path)
    console.log('-----------------------')
    let topOffset = Math.floor(landmarkResult.alignedRect.box.y + landmarkResult.alignedRect.box.height);
    let originImgWidth = landmarkResult.alignedRect.imageDims.width;
    let originImgHeight = landmarkResult.alignedRect.imageDims.height;

    console.log('-----------------------')
    console.log('|        Go Crop      |')
    console.log('-----------------------')

    const cropRes = await goCrop(topOffset,img_path, originImgWidth, originImgHeight);

    return {
        origin:img_path,
        result: './crop'+ cropRes.path.split('/crop')[1]
    }
}




var successBehind = async function(img_path) {

    console.log('-----------------------')
    console.log('|    LandMark Fail but LL4 > '+ img_path)
    console.log('-----------------------')

    const imgPathResolve = path.resolve(img_path);

    let data = fs.readFileSync(imgPathResolve);

    console.log('-----------------------')
    console.log('|        Go Crop      |')
    console.log('-----------------------')

    const cropRes = await goCrop(210,img_path, probe.sync(data).width, probe.sync(data).height);
    return {
        origin:img_path,
        result: './crop'+ cropRes.path.split('/crop')[1]
    }
}


export { successBehind, noLandMark, successLandMark }