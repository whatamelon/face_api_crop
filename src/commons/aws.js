import AWS from 'aws-sdk'

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
        return {
            status: 200,
            result:data
        };
    }).catch( function(err) {
        return {
            status: 404,
            result:''
        };
    });
}

var awsUploadImg = async (list) => {
    let resultList = [];
    const awsImgPromise = list.map(async (name) => {
        const res = await awsUpload(name);
        if(res.status == 200) {
            resultList.push(res.result);
        }
    });
  
    const promiseResult = await Promise.all(awsImgPromise);
  
    if (promiseResult) return {
        status:200,
        result:resultList
      };
      else return {
        status:404,
        result:[]
      };
}

export { awsUploadImg }