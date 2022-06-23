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
  project?: pulumi.Input<string>;
  organizationId?: pulumi.Input<string>;
  id: string;
};

export class ProjectServiceAccount extends pulumi.ComponentResource {
  /*
   * Creates the Service Account and Key used to deploy with automatic IAM role bindings.
   */

  sa: gcp.serviceaccount.Account;
  key: gcp.serviceaccount.Key;
  rawKey: pulumi.Output<string>;
  jsonKey: pulumi.Output<any>;
  iamMembership: (gcp.projects.IAMMember | gcp.organizations.IAMMember)[] = [];

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
      let membership;
      if (typeof role == 'string') {
        roleId = role;
        project = args.projectName;
      } else {
        // IamBiding with a custom project was passed
        roleId = role.id;
        project = role.project;
      }
      if (project) {
        membership = new gcp.projects.IAMMember(
          `${name}-${roleId}`,
          {
            member: pulumi.interpolate`serviceAccount:${this.sa.email}`,
            role: roleId,
            project: project,
          },
          { parent: this }
        );
      } else if (typeof role == 'object') {
        membership = new gcp.organizations.IAMMember(
          `${name}-${roleId}`,
          {
            member: pulumi.interpolate`serviceAccount:${this.sa.email}`,
            role: roleId,
            orgId: role.organizationId || '',
          },
          { parent: this }
        );
      }
      if (membership) {
        this.iamMembership.push(membership);
      }
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
