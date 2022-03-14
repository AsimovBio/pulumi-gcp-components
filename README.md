# pulumi-gcp-components

[![codecov](https://codecov.io/gh/AsimovBio/pulumi-gcp-components/branch/master/graph/badge.svg?token=xKcJUpwS1F)](https://codecov.io/gh/AsimovBio/pulumi-gcp-components)

This package offers a set of Pulumi extended features towards the GCP classic provider.

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

### Naming structure

`<radical>-<resource-name>-<suffix>`

- `radical`: project name is a common usage
- `resource-name`: required if more than one resource of the same type is created
- `suffix`: environment name is a common usage

## Options

- `radical`: define radical part of name (default: `pulumi.getProject()`)
- `suffix`: define suffix part of name (default: `undefined`)
- `defaultSuffix`: use `pulumi.getStack()` in suffix part of name (default: `false`)
