import auth0 from 'auth0-js';

require('dotenv').config();

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    clientID: process.env.REACT_APP_CLIENT_ID,
    redirectUri:
      process.env.NODE_ENV && process.env.NODE_ENV === 'dev'
        ? 'http://localhost:8080'
        : 'http://creeksidelawnandlandscape.s3-website.us-east-2.amazonaws.com',
    audience: 'https://ahermundson.auth0.com/userinfo',
    responseType: 'token id_token',
    scope: 'openid profile email'
  });

  constructor() {
    this.login = this.login.bind(this);
  }

  login() {
    this.auth0.authorize();
  }
}
