export const pinJSONToIPFS = async(JSONBody) => {
  const key = "34113141f882daca3ce4";
  const secret = "9659bc0201eeb6d0cf58237391b011391cab272e3a4758d0dcb0750041922043";
  const axios = require('axios');
  console.log(key);
  console.log(secret);
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata ⬇
    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: key,
                pinata_secret_api_key: secret,
            }
        })
        .then(function (response) {
           return {
               success: true,
               pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
           };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

    });
};