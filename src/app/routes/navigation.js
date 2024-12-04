import { ID_TOKEN } from '@seebo/common/dist/common/consts/general';

import { Modes } from 'features/CustomerWorkspace/CustomerWorkspaceConstants';

export function goToProjects(history) {
  const link = '/projects';
  history.push(link);
}

export function goToProjectVersions(projectId, history) {
  const link = `/projects/${projectId}/versions`;
  history.push(link);
}

export function goToCreateProject(history) {
  const link = '/projects/new';
  history.push(link);
}

export function goToProjectVersion(projectVersion, history, defaultMode = Modes.HOME) {
  const link = `/projects/${projectVersion.projectId}/versions/${projectVersion._id}/${defaultMode}`;
  history.push(link);
}

export function goToLoginScreen(history) {
  const link = '/login';
  localStorage.removeItem(ID_TOKEN);
  history.push(link);
}
