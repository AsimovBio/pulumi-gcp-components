import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

type ProjectServiceAccountArgs = {
  roles?: Array<string | IamRoleBinding>;
  projectName: pulumi.Input<string>;
  displayName?: pulumi.Input<string>;
  description?: pulumi.Input<string>;
  saId: string;
};

type IamRoleBinding = {
  project: pulumi.Input<string>;
  id: string;
};

export default class ProjectServiceAccount extends pulumi.ComponentResource {
  /*
   * Creates the Service Account and Key used to deploy with automatic IAM role bindings.
   */

  sa: gcp.serviceaccount.Account;
  key: gcp.serviceaccount.Key;
  rawKey: pulumi.Output<string>;
  jsonKey: pulumi.Output<Object>;
  iamMembership: gcp.projects.IAMMember[] = [];

  constructor(
    name: string,
    args: ProjectServiceAccountArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super('asimov:components:ProjectServiceAccount', name, {}, opts);

    this.sa = new gcp.serviceaccount.Account(
      args.saId,
      {
        accountId: args.saId,
        displayName: args.displayName || args.saId,
        project: args.projectName,
        description: args.description,
      },
      { parent: this }
    );

    (args.roles || []).forEach((role) => {
      let roleId;
      let project;
      if (typeof role == 'string') {
        roleId = role;
        project = args.projectName;
      } else {
        // IamBiding with a custom project was passed
        roleId = role.id;
        project = role.project;
      }
      const membership = new gcp.projects.IAMMember(
        `${name}-${roleId}`,
        {
          member: pulumi.interpolate`serviceAccount:${this.sa.email}`,
          role: roleId,
          project: project,
        },
        { parent: this }
      );
      this.iamMembership.push(membership);
    });

    this.key = new gcp.serviceaccount.Key(
      args.saId,
      {
        serviceAccountId: this.sa.name,
      },
      { parent: this }
    );
    this.rawKey = this.key.privateKey.apply((pkey) => {
      try {
        return Buffer.from(pkey, 'base64').toString('binary');
      } catch (error) {
        return '';
      }
    });
    this.jsonKey = this.rawKey.apply((rawKey) => {
      try {
        return JSON.parse(rawKey);
      } catch (error) {
        return {};
      }
    });
  }
}