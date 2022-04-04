import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as certmanager from '@pulumi/kubernetes-cert-manager';
import { ProjectServiceAccount } from './serviceaccount';

type CertManagerServiceArgs = {
  certManagerVersion: string;
  namespace: pulumi.Input<string>;
  provider: k8s.Provider;
  issuerConfigFile: string;
  certificateConfigFile: string;
  cloudDNSProject: pulumi.Input<string>;
  serviceAccountName: string;
  applicationNamespace: pulumi.Input<string>;
  sslDomain: pulumi.Input<string>;
};

export class CertManagerService extends pulumi.ComponentResource {
  /*
   * Creates the main k8s components
   */

  constructor(
    name: string,
    args: CertManagerServiceArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super('asimov:components:CertManagerService', name, {}, opts);

    // custom namespace dedicated to cert management things
    const certNs = new k8s.core.v1.Namespace(
      'cert-manager-namespace',
      {
        metadata: { name: args.namespace },
      },
      {
        provider: args.provider,
        parent: this,
      }
    );

    // Install cert-manager into the cluster.
    const certManager = new certmanager.CertManager(
      'cert-manager',
      {
        installCRDs: true,
        helmOptions: {
          namespace: args.namespace,
          version: args.certManagerVersion,
        },
      },
      { provider: args.provider, parent: this }
    );

    const cloudDNSSA = new ProjectServiceAccount(
      args.serviceAccountName,
      {
        displayName: args.serviceAccountName,
        saId: args.serviceAccountName,
        projectName: args.cloudDNSProject,
        roles: ['roles/dns.admin'],
      },
      { parent: this }
    );

    const cloudDNSSASecret = new k8s.core.v1.Secret(
      'clouddns-cert-sa-key',
      {
        metadata: { namespace: certNs.id },
        stringData: { json: cloudDNSSA.rawKey },
      },
      { parent: this, provider: args.provider }
    );

    const certIssuer = new k8s.yaml.ConfigFile(
      'cert-issuer',
      {
        file: args.issuerConfigFile,
        transformations: [
          (obj: any) => {
            obj.metadata.namespace = certNs.id;
            obj.metadata.name = 'cert-issuer';
            let dnsConfig = obj.spec.acme.solvers[0].dns01.cloudDNS;
            dnsConfig.project = args.cloudDNSProject;
            dnsConfig.serviceAccountSecretRef.name = cloudDNSSASecret.id.apply(
              (id) => id.split('/')[1] // remove full qualified name
            );
            dnsConfig.serviceAccountSecretRef.key = 'json';
          },
        ],
      },
      {
        parent: this,
        provider: args.provider,
        dependsOn: [certManager, cloudDNSSASecret],
      }
    );
    const certificate = new k8s.yaml.ConfigFile(
      'certificate',
      {
        file: args.certificateConfigFile,
        transformations: [
          (obj: any) => {
            obj.metadata.namespace = args.applicationNamespace;
            obj.spec.dnsNames = [args.sslDomain];
            obj.spec.acme.config[0].domains = [args.sslDomain];
          },
        ],
      },
      {
        parent: this,
        provider: args.provider,
        dependsOn: certIssuer,
      }
    );
  }
}
