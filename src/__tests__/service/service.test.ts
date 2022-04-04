import * as pulumi from '@pulumi/pulumi';
import { pulumiRuntimeMocks } from '../mocks/pulumi';

pulumi.runtime.setMocks(pulumiRuntimeMocks);

describe('Enable GCP Services', () => {
  let EnabledGCPServices: typeof import('../../components/service').EnabledGCPServices;

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    EnabledGCPServices = await (
      await import('../../components/service')
    ).EnabledGCPServices;
  });

  it('with an empty service list', () => {
    const enabled = new EnabledGCPServices('empty', {
      projectName: 'dummy',
      servicesToEnable: [],
    });
    expect(enabled.services).toHaveLength(0);
  });
  it('with exactly one service to enable', () => {
    const enabled = new EnabledGCPServices('one', {
      projectName: 'dummy',
      servicesToEnable: ['container.googleapis.com'],
    });
    const service = enabled.services[0];
    service.id.apply((id) => {
      expect(id).toBe('one-container.googleapis.com');
    });
    service.project.apply((project) => {
      expect(project).toBe('dummy');
    });
  });
});
