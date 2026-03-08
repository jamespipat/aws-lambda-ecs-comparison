module "lambda_power_tuning" {
  source = "github.com/aws-ia/terraform-aws-lambda-power-tuning"

  name_prefix           = local.common_name
  analyzer_function_arn = aws_lambda_function.bench.arn
}
