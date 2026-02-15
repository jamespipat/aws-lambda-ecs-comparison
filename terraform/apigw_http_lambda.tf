resource "aws_apigatewayv2_api" "http" {
  name          = "${local.common_name}-http"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.bench.arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "bench" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /bench"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_route" "cpu" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /bench/cpu"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "write" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /bench/write"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "update" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "PUT /bench/update"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}
