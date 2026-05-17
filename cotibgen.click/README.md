# cotibgen.click — AWS Static Website Infrastructure

Terraform configuration for hosting a static website on AWS for the domain **cotibgen.click**.

---

## What It Provisions

Uses the [`cloudmaniac/static-website/aws`](https://registry.terraform.io/modules/cloudmaniac/static-website/aws) Terraform module to provision:

- **S3 bucket** — stores static website files
- **CloudFront distribution** — CDN with HTTPS for the domain
- **Route 53 records** — DNS routing for both apex (`cotibgen.click`) and `www` redirect (`www.cotibgen.click`)

The module handles the S3 bucket policy, CloudFront origin access identity, and SSL certificate automatically.

---

## Prerequisites

- AWS account with Route 53 hosted zone for `cotibgen.click`
- AWS credentials configured at `~/.aws/credentials`
- Terraform >= 1.x installed

---

## Usage

```bash
# Initialize providers and modules
terraform init

# Preview changes
terraform plan

# Apply infrastructure
terraform apply
```

---

## Configuration

```hcl
# terraform.tf
provider "aws" {
  region                  = "us-east-1"
  shared_credentials_file = "~/.aws/credentials"
}

module "aws_static_website" {
  source = "cloudmaniac/static-website/aws"

  domains-zone-root       = "cotibgen.click"
  website-domain-main     = "cotibgen.click"
  website-domain-redirect = "www.cotibgen.click"
}
```

CloudFront and ACM certificates must be in `us-east-1` — the provider region is set accordingly.

---

## Deploying Content

After `terraform apply`, upload static files to the provisioned S3 bucket:

```bash
aws s3 sync ./dist/ s3://<bucket-name>/ --delete
```

To invalidate the CloudFront cache after an update:

```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

---

## Files

```
cotibgen.click/
└── terraform.tf   ← all infrastructure defined here
```
