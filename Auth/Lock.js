import Auth0Lock from 'auth0-lock';
import { red600 } from 'material-ui/styles/colors';

const options = {
  auth: {
    responseType: 'token',
    redirect: false
  },
  theme: {
    primaryColor: red600
  },
  languageDictionary: {
    title: 'Creekside'
  }
};

export default class Lock {
  lock = new Auth0Lock(
    process.env.REACT_APP_CLIENT_ID,
    process.env.REACT_APP_AUTH_DOMAIN,
    options
  );

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.lock.on('authenticated', authResult => {
      this.lock.hide();
      this.setSession(authResult);
      this.lock.getUserInfo(authResult.accessToken, (err, profile) => {
        if (profile.email_verified) {
          console.log(profile.email);
        }
      });
    });
  }

  login() {
    this.lock.show();
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // history.replace('/');
  }

  isAuthenticated() {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }
}
