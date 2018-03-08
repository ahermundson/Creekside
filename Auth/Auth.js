import auth0 from 'auth0-js';

require('dotenv').config();

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: process.env.REACT_APP_AUTH_DOMAIN,
    clientID: process.env.REACT_APP_CLIENT_ID,
    redirectUri: 'http://localhost:8080',
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
