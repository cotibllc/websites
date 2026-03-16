provider "aws" {
  region                  = "us-east-1"
  shared_credentials_file = "~/.aws/credentials"
}

module "aws_static_website" {
  source = "cloudmaniac/static-website/aws"

  # This is the domain as defined in Route53
  domains-zone-root       = "cotibgen.click"

  # Domains used for CloudFront
  website-domain-main     = "cotibgen.click"
  website-domain-redirect = "www.cotibgen.click"
}
