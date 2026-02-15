variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-southeast-1"
}

variable "project_name" {
  type        = string
  description = "Project/name prefix"
  default     = "perf-cost-lab"
}

variable "owner_tag" {
  type        = string
  description = "Owner tag"
  default     = "linkedin-lab"
}

variable "vpc_cidr" {
  type        = string
  default     = "10.20.0.0/16"
}

variable "ecs_desired_count" {
  type    = number
  default = 2
}

variable "ecs_cpu" {
  type        = number
  description = "Fargate CPU units (e.g., 256, 512, 1024, 2048)"
  default     = 512
}

variable "ecs_memory" {
  type        = number
  description = "Fargate memory (MiB) (e.g., 1024, 2048, 4096)"
  default     = 1024
}
