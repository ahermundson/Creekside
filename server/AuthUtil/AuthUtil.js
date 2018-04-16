/* eslint camelcase:0 */
/* eslint no-console:0 */

const jwt = require('jsonwebtoken');
const request = require('request');
const jwkToPem = require('jwk-to-pem');

const validateToken = async (pems, accessToken) => {
  // Verify the signature of the JWT token to ensure it's really coming from your User Pool
  try {
    const token = accessToken;
    // Fail if the token is not jwt
    const decodedJwt = jwt.decode(token, { complete: true });
    if (!decodedJwt) {
      console.log('Not a valid JWT token');
    }

    // Fail if token is not from your User Pool
    if (decodedJwt.payload.iss !== process.env.ISS) {
      console.log('Not from my user pool.');
    }

    // Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use !== 'access') {
      console.log('Not an access token');
    }

    // Get the kid from the token and retrieve corresponding PEM
    const { kid } = decodedJwt.header;
    const pem = pems[kid];
    if (!pem) {
      console.log('Invalid access token');
    }
    await jwt.verify(token, pem, { issuer: process.env.ISS });
    return decodedJwt;
  } catch (err) {
    return err;
  }
};

const createPems = (successCallback, errorCallback) => {
  let pems;
  request(
    {
      url: `${process.env.ISS}/.well-known/jwks.json`,
      json: true
    },
    (error, response, body) => {
      if (!error && response.statusCode === 200) {
        pems = {};
        const { keys } = body;
        for (let i = 0; i < keys.length; i += 1) {
          // Convert each key to PEM
          const key_id = keys[i].kid;
          const modulus = keys[i].n;
          const exponent = keys[i].e;
          const key_type = keys[i].kty;
          const jwk = { kty: key_type, n: modulus, e: exponent };
          const pem = jwkToPem(jwk);
          pems[key_id] = pem;
        }
        successCallback(pems);
      } else {
        errorCallback();
      }
    }
  );
};

module.exports = { createPems, validateToken };
