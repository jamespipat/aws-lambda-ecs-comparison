data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/artifacts/lambda_stub"
  output_path = "${path.module}/.build/lambda_stub.zip"
}


resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.common_name}-bench"
  retention_in_days = 14
}

resource "aws_lambda_permission" "allow_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.bench.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

resource "aws_lambda_function" "bench" {
  function_name = "${local.common_name}-bench"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  timeout     = 15
  memory_size = 512

  environment {
    variables = {
      LAB_NAME = local.common_name
      MODE     = "lambda"
      BENCH_WRITE_TABLE  = aws_dynamodb_table.bench_write.name
      BENCH_UPDATE_TABLE = aws_dynamodb_table.bench_update.name
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda]
}
