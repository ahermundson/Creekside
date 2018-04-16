import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

const LandingHeader = styled.div`
  @media (min-width: 700px) {
    display: none;
  }

  @media (max-width: 700px) {
    background-color: #630012;
    width: 100%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: Roboto, sans-serif;
    height: 15%;
    padding: 15px;
  }
`;

const FullLandingHeader = styled.div`
  height: 75px;
  background-color: #630012;
  width: 100%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: Roboto, sans-serif;

  @media (max-width: 700px) {
    display: none;
  }
`;

const Header = props => (
  <div>
    <LandingHeader>
      <h2
        style={{
          marginLeft: '15px',
          padding: '3px 5px 3px 5px',
          border: '1px solid white'
        }}
      >
        C
      </h2>
      {props.userInfo.isAdmin && (
        <Link to="/admin">
          <RaisedButton style={{ marginRight: '35px' }}>Admin</RaisedButton>
        </Link>
      )}
    </LandingHeader>
    <FullLandingHeader>
      <h2
        style={{
          marginLeft: '15px'
        }}
      >
        Creekside L & L
      </h2>
      {props.userInfo.isAdmin && (
        <Link to="/admin">
          <RaisedButton style={{ marginRight: '15px' }}>Admin</RaisedButton>
        </Link>
      )}
    </FullLandingHeader>
  </div>
);

const mapStateToProps = state => ({
  userInfo: state.userInfo
});

export default connect(mapStateToProps)(Header);

Header.propTypes = {
  userInfo: PropTypes.shape({
    _id: PropTypes.string,
    email: PropTypes.string,
    first_name: PropTypes.string,
    last_name: PropTypes.string,
    isAdmin: PropTypes.bool,
    isAuthenticated: PropTypes.bool
  })
};

Header.defaultProps = {
  userInfo: {}
};
