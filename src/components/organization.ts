import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

type HierarchicalBindingsArgs = {
  orgDomain: string;
  defaultProjectId?: pulumi.Input<string>;
  topLevelFolderName?: pulumi.Input<string>;
  billingAccountId?: pulumi.Input<string>;
};

export class HierarchicalBindings extends pulumi.ComponentResource {
  /*
   * Creates the basic hierarchical structure for a GCP project containing a top level Folder and an empty Project.
   */

  org: Promise<gcp.organizations.GetOrganizationResult>;
  topLevelFolder: gcp.organizations.Folder;
  project: gcp.organizations.Project;

  constructor(
    name: string,
    args: HierarchicalBindingsArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super('asimov:components:HierarchicalBindings', name, {}, opts);

    this.org = gcp.organizations.getOrganization({
      domain: args.orgDomain,
    });

    this.topLevelFolder = new gcp.organizations.Folder(
      name,
      {
        displayName: args.topLevelFolderName || name,
        parent: this.org.then((org) => org.name),
      },
      { parent: this }
    );

    this.project = new gcp.organizations.Project(
      name,
      {
        projectId: args.defaultProjectId || name,
        name: args.defaultProjectId || name,
        folderId: this.topLevelFolder.name,
        billingAccount: args.billingAccountId,
      },
      { parent: this }
    );
  }
}
