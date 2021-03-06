# pulumi-gcp-components

[![codecov](https://codecov.io/gh/AsimovBio/pulumi-gcp-components/branch/main/graph/badge.svg?token=xKcJUpwS1F)](https://codecov.io/gh/AsimovBio/pulumi-gcp-components)

This package offers a set of [Pulumi](https://pulumi.com) extended features towards the [GCP classic provider](https://www.pulumi.com/registry/packages/gcp/).

## Installing

```
yarn add @asimovbio/pulumi-gcp-components
```

## Usage

### Naming

Naming is a module with a few functions to create a standard naming convention for Pulumi resources.

#### From config: namingFromConfig

```typescript
// index.ts
import * as aws from '@pulumi/aws';
import { namingFromConfig as n } from '@asimovbio/pulumi-gcp-components';

const bucket = new aws.s3.Bucket(n('icon-bucket')); // main-icon-bucket-dev
```

```yaml
# Pulumi.dev.yaml
config:
  aws:region: us-east-1
  naming:radical: main
  naming:suffix: dev
```

#### Advanced Usage

```typescript
// index.ts
import * as gcp from '@pulumi/gcp';
import { naming } from '@asimovbio/pulumi-gcp-components';

const bucketResourceName = naming(
  {
    radical: 'main',
    suffix: 'dev',
  },
  'icon-bucket'
);

const bucket = new gcp.storage.Bucket(bucketName); // main-icon-bucket-dev
```

#### Factory: createNaming

```typescript
// index.ts
import * as gcp from '@pulumi/aws';
import { createNaming } from '@asimovbio/pulumi-gcp-components';

const naming = createNaming({
  radical: 'main',
  suffix: 'dev',
});

const bucket = new aws.s3.Bucket(naming('icon-bucket')); // main-icon-bucket-dev
```

#### Naming structure

`<radical>-<resource-name>-<suffix>`

- `radical`: project name is a common usage
- `resource-name`: required if more than one resource of the same type is created
- `suffix`: environment name is a common usage

#### Options

- `radical`: define radical part of name (default: `pulumi.getProject()`)
- `suffix`: define suffix part of name (default: `undefined`)
- `defaultSuffix`: use `pulumi.getStack()` in suffix part of name (default: `false`)

### EnabledGCPServices

[Enables a list of services](https://cloud.google.com/service-usage/docs/enable-disable) on a given GCP project. You can find the service list using:

```
gcloud service list
```

In order to list which services are enabled for a given project:

```
gcloud services list --enabled --project my-project
```

The `--project` parameter is not needed if you have the project set as default with `gcloud config set project my-project`.

To enable a list of services on a given project:

```typescript
import { EnabledGCPServices } from '@asimovbio/pulumi-gcp-components';

const enabled = new EnabledGCPServices('test', {
  projectName: 'dummy',
  servicesToEnable: [
    'container.googleapis.com',
    'logging.googleapis.com',
    'monitoring.googleapis.com',
  ],
});
```

### ServiceAccount

This component wraps up GCP's [ServiceAccounts](https://www.pulumi.com/registry/packages/gcp/api-docs/serviceaccount/), [Keys](https://www.pulumi.com/registry/packages/gcp/api-docs/serviceaccount/key/) and [IAMBindings](https://www.pulumi.com/registry/packages/gcp/api-docs/projects/iammember/) altogether. The main use case is to create a service account with an access key and the needed permissions:

```typescript
import { naming as n } from '@asimovbio/pulumi-gcp-components';
import { ProjectServiceAccount } from '@asimovbio/pulumi-gcp-components';

const serviceAccount = new ProjectServiceAccount(n(), {
  displayName: `My Deploy Key`,
  projectName: hierarchy.project.name, // used by default on IAM bindings
  roles: [
    'roles/compute.viewer',
    'roles/pubsub.admin',
    { id: 'roles/dns.admin', project: 'other-project' }, // you can specify a different project to IAM bindings.
  ],
  saId: n('deploy'),
});
```

### HierarchicalBindings

This components makes it easier to create folders and projects following the [GCP Resource Hierarchy](https://cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy). The default constructor creates a folder with a nested project:

```typescript
import { HierarchicalBindings } from '@asimovbio/pulumi-gcp-components';

const hierarchy = new HierarchicalBindings('default-folder', {
  orgDomain: 'asimov.io',
  projectId: 'my-project',
  billingAccountId: config.requireSecret('billingAccountId'),
});
```

The [Billing Account](https://cloud.google.com/billing/docs/concepts#billing_account) Id is optional, but bear in mind that you'll need one associated to a project in order to activate and use most of the GCP services.
