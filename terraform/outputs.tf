output "lambda_http_api_url" {
  value = aws_apigatewayv2_api.http.api_endpoint
}

output "lambda_bench_url" {
  value = "${aws_apigatewayv2_api.http.api_endpoint}/bench"
}

output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "ecs_bench_url" {
  value = "http://${aws_lb.this.dns_name}/bench"
}

output "ecr_repo_url" {
  value = aws_ecr_repository.bench.repository_url
}

output "power_tuning_state_machine_arn" {
  value = module.lambda_power_tuning.state_machine_arn
}
