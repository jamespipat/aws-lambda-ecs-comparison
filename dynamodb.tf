resource "aws_dynamodb_table" "bench_write" {
  name         = "${var.project_name}-bench-write"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  attribute { 
    name = "pk" 
    type = "S" 
  }
  attribute { 
    name = "sk" 
    type = "S" 
  }

  point_in_time_recovery { enabled = true }
}

resource "aws_dynamodb_table" "bench_update" {
  name         = "${var.project_name}-bench-update"
  billing_mode = "PAY_PER_REQUEST"

  hash_key  = "pk"
  range_key = "sk"

  attribute { 
    name = "pk" 
    type = "S" 
  }

  attribute { 
    name = "sk" 
    type = "S" 
  }

  point_in_time_recovery { enabled = true }
}
