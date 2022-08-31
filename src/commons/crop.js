const sharp = require('sharp');
const path = require('path');


var goCrop = function(topOffset,img_path, originImgWidth, originImgHeight){
    var promise = new Promise(function(resolve, reject) {

        const inputImage = path.resolve(img_path);
        const outputImage = path.resolve('./crop/'+img_path.split('./uploads/')[1].split('.')[0]+'_cropped.jpg');

        
        let height = Math.floor(originImgHeight - topOffset);
        let width = Math.floor((height/originImgHeight) * originImgWidth);
        let left = Math.floor((originImgWidth - width)/2);

        sharp(inputImage).extract({ width: width, height: height, left: left, top: topOffset }).resize(width, height).toFile(outputImage)
            .then(function(new_file_info) {
                resolve({
                    status: 200,
                    path: outputImage
                });  
            })
            .catch(function(err) {
                reject({
                    status: 404,
                    path: ''
                });
            });
    });
    return promise; 
}

export { goCrop }

// original image