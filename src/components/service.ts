import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

interface EnabledGCPServicesArgs {
  projectName: pulumi.Input<string>;
  servicesToEnable: string[];
}

export class EnabledGCPServices extends pulumi.ComponentResource {
  /* 
    Enables a list of services/APIs on a given project.
  */

  services: gcp.projects.Service[] = [];

  constructor(
    name: string,
    args: EnabledGCPServicesArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super('asimov:components:EnabledGCPServices', name, {}, opts);

    args.servicesToEnable.forEach((serviceName) => {
      const service = new gcp.projects.Service(
        `${name}-${serviceName}`,
        {
          disableDependentServices: true,
          project: args.projectName,
          service: serviceName,
        },
        { parent: this, aliases: [{ name: serviceName, parent: this }] }
      );
      this.services.push(service);
    });
  }
}
