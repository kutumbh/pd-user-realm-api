const http = require('https')

function convertUrlToImage (url)  {
    return new Promise((resolve,reject)=>{
        http.get(url,(res)=>{

            if(res.statusCode !== 200){
                reject(new Error("Error: "+response.statusCode))
                return;
            }
            
            const imgData = [] 
            res.on('data',(d)=>{
                imgData.push(d)
            })
    
            res.on('end',()=>{
                const imgBuffer = Buffer.concat(imgData)
                const finalImgData = imgBuffer.toString('base64')
                resolve(finalImgData)
            })

            res.on('error', (error) => {
                reject(error);
              });
        }) 
    })
}


module.exports = convertUrlToImage

