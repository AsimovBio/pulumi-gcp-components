import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

type ProjectLogSinkArgs = {
  projectName: pulumi.Input<string>;
  destinationUrl: pulumi.Input<string>;
  topicArgs?: gcp.pubsub.TopicArgs;
  subscriptionArgs?: gcp.pubsub.SubscriptionArgs;
  exclusionCriteria?: gcp.types.input.logging.ProjectSinkExclusion[];
};

export class ProjectLogSink extends pulumi.ComponentResource {
  topic: gcp.pubsub.Topic;
  subscription: gcp.pubsub.Subscription;
  sink: gcp.logging.ProjectSink;
  /*
   * Creates a "logging sink" with Topics/Subscriptions
   * https://cloud.google.com/logging/docs/routing/overview
   */

  constructor(
    name: string,
    args: ProjectLogSinkArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super('asimov:components:ProjectLogSink', name, {}, opts);
    this.topic = new gcp.pubsub.Topic(
      name,
      {
        ...args.topicArgs,
        project: args.projectName,
      },
      { parent: this }
    );

    this.subscription = new gcp.pubsub.Subscription(
      name,
      {
        ...args.subscriptionArgs,
        topic: this.topic.name,
        project: args.projectName,
        pushConfig: {
          pushEndpoint: args.destinationUrl,
        },
      },
      { parent: this }
    );
    this.sink = new gcp.logging.ProjectSink(
      name,
      {
        destination: pulumi.interpolate`pubsub.googleapis.com/projects/${args.projectName}/topics/${this.topic.name}`,
        exclusions: args.exclusionCriteria,
        project: args.projectName,
      },
      { parent: this }
    );
    // grants default cloud-logs SA publish access to Topics
    // https://cloud.google.com/logging/docs/export/configure_export_v2#dest-auth
    new gcp.projects.IAMMember(
      name,
      {
        role: 'roles/pubsub.publisher',
        member: 'serviceAccount:cloud-logs@system.gserviceaccount.com',
        project: args.projectName,
      },
      { parent: this }
    );
  }
}
