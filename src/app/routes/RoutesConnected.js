import { getUserApiToken } from '@seebo/common/dist/common/utils/utils';
import { getUserRoleId } from '@seebo/common/dist/entities/LoggedInUser/LoggedInUserSelectors';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { SeeboWebApi } from 'api/SeeboWebApi';

import { ProjectActions } from 'features/Projects/store/ProjectActions';

import { LoggedInUserActions } from 'entities/LoggedInUser/LoggedInUserActions';

import { CustomerWorkspaceActions } from '../../features/CustomerWorkspace/store/CustomerWorkspaceActions';
import RoutesComponent from './RoutesComponent';

const mapStateToProps = state => {
  const { companiesReducer, loggedInUserReducer } = state;
  const userToken = getUserApiToken();
  const { activeCompany: company } = companiesReducer;
  const { user: authenticatedUser, restrictions } = loggedInUserReducer;
  const roleId = getUserRoleId(state);
  const seeboWebApiInstance = SeeboWebApi(state);
  return {
    roleId,
    userToken,
    authenticatedUser,
    company,
    restrictions,
    seeboWebApiInstance,
  };
};
const mapDispatchToProps = {
  setUserRestrictions: LoggedInUserActions.setUserRestrictions,
  setLoggedInUser: LoggedInUserActions.setLoggedInUser,
  getProjectAndProjectVersion: ProjectActions.getProjectAndProjectVersion,
  setRedirectParams: CustomerWorkspaceActions.setRedirectParams,
  setCurrentMode: CustomerWorkspaceActions.setCurrentMode,
};

export const Routes = withRouter(connect(mapStateToProps, mapDispatchToProps)(RoutesComponent));
