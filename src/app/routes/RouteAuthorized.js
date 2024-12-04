import { getUserApiToken } from '@seebo/common/dist/common/utils/utils';
import { RedirectUnauthorizedToProjects } from '@seebo/common/dist/components/sharedComponents/components/ShowIfPermitted';
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

export class RouteAuthorized extends React.Component {
  wrapComponentWithPermissions = routeRenderProps => {
    const { resourcePermission, render } = this.props;
    const routeComponentToRender = render(routeRenderProps);
    const userToken = getUserApiToken();
    if (!userToken && _.get(routeRenderProps, 'match.path') !== '/login') {
      return <Redirect to="/login" />;
    }
    return (
      <RedirectUnauthorizedToProjects resourcePermission={resourcePermission}>
        {routeComponentToRender}
      </RedirectUnauthorizedToProjects>
    );
  };

  render() {
    const { resourcePermission, render, ...routeProps } = this.props;
    return <Route {...routeProps} render={routeRenderProps => this.wrapComponentWithPermissions(routeRenderProps)} />;
  }
}
