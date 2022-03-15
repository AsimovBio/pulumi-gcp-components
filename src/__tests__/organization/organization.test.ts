import * as pulumi from '@pulumi/pulumi';
import { pulumiRuntimeMocks } from '../mocks';

pulumi.runtime.setMocks(pulumiRuntimeMocks);

describe('Create Folder/Project Structure', () => {
  let HierarchicalBindings: typeof import('../../components/organization').default;

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    HierarchicalBindings = await (
      await import('../../components/organization')
    ).default;
  });

  it('with default values', () => {
    const hierarchy = new HierarchicalBindings('basic', {
      orgDomain: 'asimov.test.com',
    });
    hierarchy.project.name.apply((name) => {
      expect(name).toBe('basic');
    });
    hierarchy.topLevelFolder.displayName.apply((displayName) => {
      expect(displayName).toBe('basic');
    });
    hierarchy.project.billingAccount.apply((billingAccount) => {
      expect(billingAccount).toBeUndefined();
    });
  });
  it('passing all params', () => {
    const hierarchy = new HierarchicalBindings('basic', {
      orgDomain: 'asimov.test.com',
      defaultProjectId: 'my-project',
      topLevelFolderName: 'my-folder',
      billingAccountId: '123-456-789',
    });
    hierarchy.project.name.apply((name) => {
      expect(name).toBe('my-project');
    });
    hierarchy.topLevelFolder.displayName.apply((displayName) => {
      expect(displayName).toBe('my-folder');
    });
    hierarchy.project.billingAccount.apply((billingAccount) => {
      expect(billingAccount).toBe('123-456-789');
    });
  });
});
