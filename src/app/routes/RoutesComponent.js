import { getUserApiToken } from '@seebo/common/dist/common/utils/utils';
import { SeeboLoaderEntirePage } from '@seebo/common/dist/components/SeeboLoader/SeeboLoaderEntirePage';
import { PERMISSIONS, RESOURCES } from '@seebo/permissions';
import _ from 'lodash';
import * as queryString from 'query-string';
import React from 'react';
import { browserName } from 'react-device-detect';
import { Redirect, Switch } from 'react-router-dom';

import { AuthScreen } from 'features/Auth/AuthConnected';
import GeneralOverviewComponent from 'features/GeneralOverview/GeneralOverviewComponent';
import { ProjectVersions } from 'features/ProjectVersions/ProjectVersionsConnected';
import { Projects } from 'features/Projects/ProjectsConnected';
import { SampleProjects } from 'features/SampleProjects/SampleProjectsConnected';
import Settings from 'features/Settings/SettingsConnected';
import { Version } from 'features/Version/VersionConnected';

import { NotSupportedBrowserComponent } from 'components/NotSupportedBrowser/NotSupportedBrowserComponent';
import { ThirdPartyLicenseComponent } from 'components/ThirdPartyLicense/ThirdPartyLicenseComponent';

import { UnleashClassFlagProvider } from '../../components/Unleash/UnleashClassFlagProvider';
import { RouteAuthorized } from './RouteAuthorized';
import { goToProjects } from './navigation';

class RoutesComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    };
  }

  componentDidMount() {
    const { location, setRedirectParams, setCurrentMode } = this.props;
    const { pathname, search } = location;
    const { innerTabPath, innerModePath } = this.getUserRedirectUrlParams(pathname);
    setRedirectParams({
      queryString: search,
      redirectMoveToPage: innerTabPath,
      redirectPath: pathname,
    });
    setCurrentMode(innerModePath);
    this.fetchUserRequirements().catch(() => this.setState({ isLoading: false }));
  }

  componentDidUpdate(prevProps) {
    const { authenticatedUser: prevAuthenticatedUser, company: prevCompany } = prevProps;
    const { authenticatedUser } = this.props;
    if (!Boolean(prevAuthenticatedUser) && Boolean(authenticatedUser)) {
      this.setState({ isLoading: true });
    }
    this.fetchUserRestrictionsIfNeeded(prevAuthenticatedUser, prevCompany);
  }

  getUserRedirectUrlParams = pathname => {
    let innerTabPath, innerModePath;
    const isRedirect = pathname.indexOf('redirectTo') !== -1;
    if (isRedirect) {
      const innerTabModeRegex = /\/(\w+)\/redirectTo\/(\w+)/;
      const match = pathname.match(innerTabModeRegex);
      if (Boolean(match)) {
        innerModePath = match[1];
        innerTabPath = match[2];
      }
    }
    if (pathname === '/insight') {
      innerTabPath = 'EnvelopeInsights';
    }
    if (pathname === '/monitor') {
      innerTabPath = 'EnvelopeMonitorTracking';
    }
    return { innerTabPath, innerModePath };
  };

  fetchUserRestrictionsIfNeeded = (prevAuthenticatedUser, prevCompany) => {
    const { authenticatedUser, company } = this.props;
    if (!Boolean(authenticatedUser) || !Boolean(company)) {
      return;
    }
    const isSameUser = _.get(prevAuthenticatedUser, '_id') === _.get(authenticatedUser, '_id');
    const isSameCompany = _.get(prevCompany, '_id') === _.get(company, '_id');
    if ((isSameUser || !prevAuthenticatedUser) && !isSameCompany) {
      this.updateUserRestrictions(authenticatedUser._id, company._id)
        .then(() => {
          this.setState({ isLoading: false });
        })
        .catch(e => {
          console.error(`failed to fetch user restrictions for company: ${company._id}`, e);
        });
    }
  };

  updateUserRestrictions = async (userId, companyId) => {
    const { setUserRestrictions, seeboWebApiInstance } = this.props;
    const restrictions = await seeboWebApiInstance.userManagementService.users.getRestrictionsById(userId, companyId);
    setUserRestrictions(restrictions);
  };

  fetchUserRequirements = () => {
    const { setLoggedInUser, userToken, history, location } = this.props;
    const { userToken: userTokenFromQuery } = queryString.parse(location.search);
    if (!Boolean(userToken) && !Boolean(userTokenFromQuery)) {
      return Promise.reject(new Error());
    }
    return setLoggedInUser(history, userToken || userTokenFromQuery);
  };

  renderProject = () => {
    const { authenticatedUser, roleId, history } = this.props;
    const userRole = authenticatedUser?.roles[roleId];
    if (userRole === 'seebo') {
      goToProjects(history);
    } else {
      this.navigateToHomePage();
    }
  };

  navigateToHomePage = () => {
    const { company, getProjectAndProjectVersion, history, authenticatedUser, roleId } = this.props;
    getProjectAndProjectVersion(company, history, authenticatedUser, roleId);
  };

  renderRoutes = () => {
    return (
      <UnleashClassFlagProvider
        flagName="platform_browsers"
        render={({ isEnabled }) => {
          const enable = isEnabled();
          if (!Boolean(enable) && browserName !== 'Safari' && browserName !== 'Chrome') {
            return <NotSupportedBrowserComponent />;
          }
          return (
            <Switch>
              <RouteAuthorized
                exact
                path={`/projects/:projectId/versions`}
                resourcePermission={{ resource: RESOURCES.version, permission: PERMISSIONS.read }}
                render={({ match }) => <ProjectVersions projectId={match.params.projectId} />}
              />
              <RouteAuthorized
                exact
                path={`/projects/:projectId/versions/new`}
                resourcePermission={{ resource: RESOURCES.version, permission: PERMISSIONS.create }}
                render={() => <SampleProjects />}
              />
              <RouteAuthorized
                exact
                path={`/projects/new`}
                resourcePermission={{ resource: RESOURCES.project, permission: PERMISSIONS.create }}
                render={() => <SampleProjects />}
              />

              <RouteAuthorized
                path={`/projects/:projectId/versions/:versionId`}
                resourcePermission={{ resource: RESOURCES.version, permission: PERMISSIONS.read }}
                render={({ match }) => (
                  <Version
                    projectId={match.params.projectId}
                    versionId={match.params.versionId}
                    isShowIntercom={this.props.isShowIntercom}
                  />
                )}
              />
              <RouteAuthorized
                path={`/manage`}
                resourcePermission={{ resource: RESOURCES.settings, permission: PERMISSIONS.update }}
                render={() => <Settings />}
              />
              <RouteAuthorized
                path={`/overview`}
                resourcePermission={{ resource: RESOURCES.settings, permission: PERMISSIONS.update }}
                render={() => <GeneralOverviewComponent />}
              />
              <RouteAuthorized
                path={`/third-party-license`}
                resourcePermission={{ resource: RESOURCES.thirdPartyLicense, permission: PERMISSIONS.read }}
                render={() => <ThirdPartyLicenseComponent />}
              />
              <RouteAuthorized path={'/login'} render={() => <AuthScreen />} />
              <RouteAuthorized path={`/projects`} render={() => <Projects />} />
              {/*default route*/}
              <RouteAuthorized path={`/`} render={this.renderProject} />
            </Switch>
          );
        }}
      />
    );
  };

  render() {
    const { isLoading } = this.state;
    const userToken = getUserApiToken();
    const currentPathname = window.location.pathname;
    if (!userToken && currentPathname !== '/login') {
      return <Redirect to="/login" />;
    }
    return isLoading ? <SeeboLoaderEntirePage /> : this.renderRoutes();
  }
}

export default RoutesComponent;
