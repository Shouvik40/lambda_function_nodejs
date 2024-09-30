
const AWS = require('aws-sdk'); 
var jimp = require("jimp");

const s3 = new AWS.S3(); 

const DEST_BUCKET = process.env.DEST_BKT_PATH;


async function imgResize(data) {
    const buffer = Buffer.from(data);
    const res = await jimp.read(buffer);   
    return await res.resize(100,100);
}
  
  
exports.handler = async (event) => {

    let myFileOps = event.Records.map( async(record) => {

        let bucket = record.s3.bucket.name;
        let filename = record.s3.object.key;
        
        var params = {
            Bucket: bucket,
            Key: filename
        };

        let inputData = await s3.getObject(params).promise();

        const img = await imgResize(inputData.Body); 
        
        let resizedBuffer;
        
        await img.getBuffer(jimp.MIME_JPEG, (err, buffer) => {

            resizedBuffer = buffer;
           
          });
       
          let targetFilename = filename;
                
          var params = {
              Bucket: DEST_BUCKET,
              Key: targetFilename,
              Body: resizedBuffer,
              ContentType: 'image/jpeg'
          };

      await s3.putObject(params).promise();

    });

    await Promise.all(myFileOps);
    console.log("done");
    return "done";
}


// const AWS = require('aws-sdk'); 
// var jimp = require("jimp");

// const s3 = new AWS.S3(); 
// const ses = new AWS.SES({ region: 'us-east-1' }); 

// const DEST_BUCKET = process.env.DEST_BKT_PATH;
// const EMAIL_FROM = 'paulshouvik56@gmail.com'; 
// const EMAIL_TO_1 = 'paulshouvik56@gmail.com'; 
// const EMAIL_TO_2 = 'shouvikpaul40@gmail.com'; 

// // Track image processing in memory
// let imageProcessingLog = [];

// // Function to resize the image
// async function imgResize(data) {
//     const buffer = Buffer.from(data);
//     const res = await jimp.read(buffer);   
//     return await res.resize(100, 100);
// }

// // Function to update the image processing log and check the count
// function updateImageProcessingLog() {
//     const now = Date.now();
//     const tenMinutesAgo = now - (10 * 60 * 1000);

//     // Filter the log to keep entries within the last 10 minutes
//     imageProcessingLog = imageProcessingLog.filter((entry) => entry >= tenMinutesAgo);

//     // Return the updated count
//     return imageProcessingLog.length;
// }

// // Function to send email
// async function sendEmail(recipientList, message) {
//     const params = {
//         Destination: {
//             ToAddresses: recipientList,
//         },
//         Message: {
//             Body: {
//                 Text: {
//                     Data: message,
//                 },
//             },
//             Subject: {
//                 Data: "Image Processing Alert",
//             },
//         },
//         Source: EMAIL_FROM,
//     };
    
//     await ses.sendEmail(params).promise();
// }

// // Lambda handler
// exports.handler = async (event) => {
//     let myFileOps = event.Records.map(async (record) => {
//         let bucket = record.s3.bucket.name;
//         let filename = record.s3.object.key;
        
//         var params = {
//             Bucket: bucket,
//             Key: filename
//         };

//         let inputData = await s3.getObject(params).promise();
//         const img = await imgResize(inputData.Body); 
        
//         let resizedBuffer;
//         await img.getBuffer(jimp.MIME_JPEG, (err, buffer) => {
//             resizedBuffer = buffer;
//         });
        
//         let targetFilename = filename;
//         var uploadParams = {
//             Bucket: DEST_BUCKET,
//             Key: targetFilename,
//             Body: resizedBuffer,
//             ContentType: 'image/jpeg'
//         };

//         await s3.putObject(uploadParams).promise();
        
//         // Add the current timestamp to the image processing log
//         imageProcessingLog.push(Date.now());
//     });

//     await Promise.all(myFileOps);

//     // Check the image count in the last 10 minutes
//     const imageCount = updateImageProcessingLog();

//     if (imageCount < 5) {
//         await sendEmail([EMAIL_TO_1], "Less than 5 images processed in the last 10 minutes."); 
//     } else {
//         await sendEmail([EMAIL_TO_1, EMAIL_TO_2], "More than 5 images processed in the last 10 minutes."); 
//     }

//     console.log("done");
//     return "done";
// };
