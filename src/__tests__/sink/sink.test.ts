import * as pulumi from '@pulumi/pulumi';
import { pulumiRuntimeMocks } from '../mocks/pulumi';

pulumi.runtime.setMocks(pulumiRuntimeMocks);

describe('Create Project Log Sink', () => {
  let ProjectLogSink: typeof import('../../components/sink').ProjectLogSink;

  beforeAll(async () => {
    // It's important to import the program _after_ the mocks are defined.
    ProjectLogSink = await (
      await import('../../components/sink')
    ).ProjectLogSink;
  });

  it('passing all the values', () => {
    const pls = new ProjectLogSink('log-sink', {
      destinationUrl: 'https://provider-url.test',
      projectName: 'project-name',
    });
    pulumi
      .all([pls.topic.project, pls.subscription.pushConfig])
      .apply(([project, pushConfig]) => {
        expect(project).toBe('project-name');
        expect(pushConfig?.pushEndpoint).toBe('https://provider-url.test');
      });
  });
});
