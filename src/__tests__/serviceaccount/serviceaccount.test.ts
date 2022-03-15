import { GcpUserAccessBinding } from '@pulumi/gcp/accesscontextmanager';
import * as pulumi from '@pulumi/pulumi';
import { pulumiRuntimeMocks } from '../mocks';

pulumi.runtime.setMocks(pulumiRuntimeMocks);

describe('Create a Service Account + Keypair', () => {
  let ProjectServiceAccount: typeof import('../../components/serviceaccount').default;

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    ProjectServiceAccount = await (
      await import('../../components/serviceaccount')
    ).default;
  });

  it('with an empty role list and default values', () => {
    const sa = new ProjectServiceAccount('empty', {
      projectName: 'my-project',
      saId: 'my-sa',
    });
    expect(sa.iamMembership).toHaveLength(0);
    sa.sa.displayName.apply((name) => {
      expect(name).toBe('my-sa');
    });
    expect(sa.key).toBeDefined();
  });
  it('passing all the values', () => {
    const sa = new ProjectServiceAccount('empty', {
      projectName: 'my-project',
      saId: 'my-sa',
      description: 'my-description',
      displayName: 'my-display-name',
    });
    pulumi
      .all([sa.sa.displayName, sa.sa.description, sa.sa.accountId])
      .apply(([displayName, description, accountId]) => {
        expect(description).toBe('my-description');
        expect(displayName).toBe('my-display-name');
        expect(accountId).toBe('my-sa');
      });
  });
  it('passing string roles for binding', () => {
    const sa = new ProjectServiceAccount('empty', {
      projectName: 'my-project',
      saId: 'my-sa',
      roles: ['roles/dns.viewer'],
    });
    sa.iamMembership[0].project.apply((project) => {
      expect(project).toBe('my-project');
    });
    sa.iamMembership[0].role.apply((role) => {
      expect(role).toBe('roles/dns.viewer');
    });
  });
  it('passing IAMBindings binding', () => {
    const sa = new ProjectServiceAccount('empty', {
      projectName: 'my-project',
      saId: 'my-sa',
      roles: [{ project: 'another-project', id: 'roles/dns.admin' }],
    });
    sa.iamMembership[0].project.apply((project) => {
      expect(project).toBe('another-project');
    });
    sa.iamMembership[0].role.apply((role) => {
      expect(role).toBe('roles/dns.admin');
    });
  });
});
