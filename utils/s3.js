const AWS = require('aws-sdk');

const uploadToS3 = async(data,filename,contype)=>{
    const BUCKET_NAME=process.env.BUCKET;
    const IAM_USER_KEY=process.env.ACCESS_KEY;
    const IAM_USER_SECRET=process.env.SECURITY_ACCESS_KEY;

    let s3bucket = new AWS.S3({
        accessKeyId:IAM_USER_KEY,
        secretAccessKey:IAM_USER_SECRET,
    })

    var params = {
        Bucket:BUCKET_NAME,
        Key:filename,
        Body:data,
        ContentType:contype, 
        ContentDisposition: 'inline',
        ACL:'public-read'
    }
   
    return new Promise((res,rej)=>{
        s3bucket.upload(params,(err,s3response)=>{
            if(err){
                console.log('err in file upload',err);
                rej(err);
            }
            else{
                console.log('success',s3response);
                res(s3response.Location);
            }
        })
    })

}

module.exports={uploadToS3};