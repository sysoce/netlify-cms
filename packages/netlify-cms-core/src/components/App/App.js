import PropTypes from 'prop-types';
import React from 'react';
import { hot } from 'react-hot-loader';
import ImmutablePropTypes from 'react-immutable-proptypes';
import styled from 'react-emotion';
import { connect } from 'react-redux';
// import { Route, Switch, Redirect } from 'react-router-dom';
import { Notifs } from 'redux-notifications';
// import TopBarProgress from 'react-topbar-progress-indicator';
import { loadConfig } from 'Actions/config';
import { loginUser, logoutUser } from 'Actions/auth';
import { currentBackend } from 'src/backend';
import { createNewEntry } from 'Actions/collections';
// import { openMediaLibrary } from 'Actions/mediaLibrary';
// import MediaLibrary from 'MediaLibrary/MediaLibrary';
// import { Toast } from 'UI';
// import { Loader, colors } from 'netlify-cms-ui-default';
// import history from 'Routing/history';
import { SIMPLE, EDITORIAL_WORKFLOW } from 'Constants/publishModes';
// import Collection from 'Collection/Collection';
// import Workflow from 'Workflow/Workflow';
// import Editor from 'Editor/Editor';
// import NotFoundPage from './NotFoundPage';
// import Header from './Header';

import Editor from 'Editor';

// TopBarProgress.config({
//   barColors: {
//     '0': colors.active,
//     '1.0': colors.active,
//   },
//   shadowBlur: 0,
//   barThickness: 2,
// });

// const AppMainContainer = styled.div`
//   min-width: 800px;
//   max-width: 1440px;
//   margin: 0 auto;
// `;

// const ErrorContainer = styled.div`
//   margin: 20px;
// `;

// const ErrorCodeBlock = styled.pre`
//   margin-left: 20px;
//   font-size: 15px;
//   line-height: 1.5;
// `;


class App extends React.Component {
  static propTypes = {
    auth: ImmutablePropTypes.map,
    config: ImmutablePropTypes.map,
    collections: ImmutablePropTypes.orderedMap,
    loadConfig: PropTypes.func.isRequired,
    loginUser: PropTypes.func.isRequired,
    logoutUser: PropTypes.func.isRequired,
    user: ImmutablePropTypes.map,
    isFetching: PropTypes.bool.isRequired,
    publishMode: PropTypes.oneOf([SIMPLE, EDITORIAL_WORKFLOW]),
    siteId: PropTypes.string
  };

  static configError(config) {
    return (
      <div>
        <h1>Error loading the CMS configuration</h1>

        <div>
          <strong>Config Errors:</strong>
          <pre>{config.get('error')}</pre>
          <span>Check your config.yml file.</span>
        </div>
      </div>
    );
  }

  componentDidMount() {
    console.log("componentDidMount")
    const { loadConfig } = this.props;
    loadConfig();
  }

  handleLogin(credentials) {
    this.props.loginUser(credentials);
  }

  authenticating() {
    console.log("authenticating")
    const { auth } = this.props;
    const backend = currentBackend(this.props.config);

    if (backend == null) {
      return (
        <div>
          <h1>Waiting for backend...</h1>
        </div>
      );
    }

    return (
      <div>
        <Notifs />
        {React.createElement(backend.authComponent(), {
          onLogin: this.handleLogin.bind(this),
          error: auth && auth.get('error'),
          isFetching: auth && auth.get('isFetching'),
          inProgress: (auth && auth.get('isFetching')) || false,
          siteId: this.props.config.getIn(['backend', 'site_domain']),
          base_url: this.props.config.getIn(['backend', 'base_url'], null),
          authEndpoint: this.props.config.getIn(['backend', 'auth_endpoint']),
          config: this.props.config,
        })}
      </div>
    );
  }

  handleLinkClick(event, handler, ...args) {
    event.preventDefault();
    handler(...args);
  }

  render() {
    const {
      user,
      config,
      collections,
      logoutUser,
      isFetching
    } = this.props;

    if (config === null) {
      return null;
    }

    if (config.get('error')) {
      console.log("error")
      return App.configError(config);
    }

    if (config.get('isFetching')) {
      console.log("isFetching")
      // return <Loader active>Loading configuration...</Loader>;
      return <p>Loading configuration...</p>;
    }

    if (user == null) {
      return this.authenticating();
    }

    if(!window.editor) window.editor = new Editor();

    const defaultPath = `/collections/${collections.first().get('name')}`;

    return (
        <div className="App">
            <h2>Using CKEditor 5</h2>
        </div>
    );
  }
}

function mapStateToProps(state) {
  const { auth, config, collections, globalUI, mediaLibrary } = state;
  const user = auth && auth.get('user');
  const isFetching = globalUI.get('isFetching');
  return {
    auth,
    config,
    collections,
    user,
    isFetching
  };
}

const mapDispatchToProps = {
  loadConfig,
  loginUser,
  logoutUser,
};

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(App),
);
