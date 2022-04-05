import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';
import * as certmanager from '@pulumi/kubernetes-cert-manager';
import { ProjectServiceAccount } from './serviceaccount';

type CertManagerServiceArgs = {
  certManagerVersion: string;
  namespace: pulumi.Input<string>;
  provider: k8s.Provider;
  issuerConfigFile: string;
  cloudDNSProject: pulumi.Input<string>;
  serviceAccountName: string;
  certificateConfiguration: CertificateConfiguration[];
};

type CertificateConfiguration = {
  configFile: string;
  domains: pulumi.Input<string>[];
  namespace: pulumi.Input<string>;
};

export class CertManagerService extends pulumi.ComponentResource {
  /*
   * Creates the main k8s components
   */

  certificates: k8s.yaml.ConfigFile[] = [];
  args: CertManagerServiceArgs;
  certIssuer: k8s.yaml.ConfigFile;

  constructor(
    name: string,
    args: CertManagerServiceArgs,
    opts?: pulumi.ResourceOptions
  ) {
    super('asimov:components:CertManagerService', name, {}, opts);
    this.args = args;
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

    this.certIssuer = new k8s.yaml.ConfigFile(
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
    args.certificateConfiguration.forEach((config, index) => {
      this.addCertificate(`certificate-${index}`, config);
    }, this);
  }
  public addCertificate(name: string, config: CertificateConfiguration) {
    const certificate = new k8s.yaml.ConfigFile(
      name,
      {
        file: config.configFile,
        transformations: [
          (obj: any) => {
            obj.metadata.namespace = config.namespace;
            obj.spec.dnsNames = config.domains;
            obj.spec.acme.config[0].domains = config.domains;
          },
        ],
      },
      {
        parent: this,
        provider: this.args.provider,
        dependsOn: this.certIssuer,
        aliases: ['certificate'],
      }
    );
    this.certificates.push(certificate);
  }
}
