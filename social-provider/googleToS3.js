const AWS = require('aws-sdk');
const googleImage = require('./saveImageFromUrl')
//const demourl = "https://lh3.googleusercontent.com/a/AAcHTtcJUD8X4Z4Ig3UqpIjCytEN3oa4gAPZLc3_sBSMzNC16_w=s96-c"


function s3Upload(userId,googleUrl){

    const awsConfig = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      bucketName: process.env.AWS_BUCKET_NAME,
    };


    AWS.config.update(awsConfig);
    const s3 = new AWS.S3();


    function uploadImageToS3(imageData) {
      const params = {
        Bucket: awsConfig.bucketName+ "/" + "profileImage"+"/"+userId,
        Key: Date.now().toString() + '_' + 'image.jpg',
        Body: Buffer.from(imageData, 'base64'),
        ContentType: 'image/jpeg', 
      };

      return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
          if (err) {
            reject(err); 
          } else {
            resolve(data.Location); 
          }
        });
      });
    }


return new Promise((resolve,reject)=>{
  googleImage(googleUrl)
  .then((imageData)=>{
      uploadImageToS3(imageData)
      .then((imageUrl) => {

      resolve(imageUrl)

    })
    .catch((error) => {
      reject(error)
      console.error('Error:', error.message);
    });

  });
})

}
 module.exports = s3Upload;




