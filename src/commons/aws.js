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
        return 200;
    }).catch( function(err) {
        return 404;
    });

}