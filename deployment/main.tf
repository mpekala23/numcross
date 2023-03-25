data "aws_availability_zones" "available_zones" {
  state = "available"
}

resource "aws_vpc" "default" {
  cidr_block = "10.32.0.0/16"
}

resource "aws_subnet" "public" {
  count                   = 2
  cidr_block              = cidrsubnet(aws_vpc.default.cidr_block, 8, 2 + count.index)
  availability_zone       = data.aws_availability_zones.available_zones.names[count.index]
  vpc_id                  = aws_vpc.default.id
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private" {
  count             = 2
  cidr_block        = cidrsubnet(aws_vpc.default.cidr_block, 8, count.index)
  availability_zone = data.aws_availability_zones.available_zones.names[count.index]
  vpc_id            = aws_vpc.default.id
}

resource "aws_internet_gateway" "gateway" {
  vpc_id = aws_vpc.default.id
}

resource "aws_route" "internet_access" {
  route_table_id         = aws_vpc.default.main_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.gateway.id
}

resource "aws_eip" "gateway" {
  count      = 2
  vpc        = true
  depends_on = [aws_internet_gateway.gateway]
}

resource "aws_nat_gateway" "gateway" {
  count         = 2
  subnet_id     = element(aws_subnet.public.*.id, count.index)
  allocation_id = element(aws_eip.gateway.*.id, count.index)
}

resource "aws_route_table" "private" {
  count  = 2
  vpc_id = aws_vpc.default.id

  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = element(aws_nat_gateway.gateway.*.id, count.index)
  }
}

resource "aws_route_table_association" "private" {
  count          = 2
  subnet_id      = element(aws_subnet.private.*.id, count.index)
  route_table_id = element(aws_route_table.private.*.id, count.index)
}

resource "aws_security_group" "numcross_lb_security_group" {
  name        = "numcross-lb-security-group"
  vpc_id      = aws_vpc.default.id

  ingress {
    protocol    = "tcp"
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb" "numcross_lb" {
  name            = "numcross-lb"
  subnets         = aws_subnet.public.*.id
  security_groups = [aws_security_group.numcross_lb_security_group.id]
}

resource "aws_lb_target_group" "numcross_target_group" {
  name        = "numcross-target-group"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.default.id
  target_type = "ip"
}

resource "aws_lb_listener" "numcross_listener" {
  load_balancer_arn = aws_lb.numcross_lb.id
  port              = 443
  protocol          = "HTTPS"
  depends_on = [
    aws_lb_target_group.numcross_target_group,
  ]
  certificate_arn   = "arn:aws:acm:us-east-1:720116267795:certificate/8bca9204-4353-4c11-bd56-4003c4de7d68"

  default_action {
    target_group_arn = aws_lb_target_group.numcross_target_group.id
    type             = "forward"
  }
}

resource "aws_ecs_task_definition" "numcross_ecs_task" {
  family                   = "numcross_ecs_task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 2048
  memory                   = 4096
  execution_role_arn = aws_iam_role.numcross_ecs_role.arn

  container_definitions = <<DEFINITION
[
  {
    "image": "720116267795.dkr.ecr.us-east-1.amazonaws.com/numcross_repo:latest",
    "cpu": 2048,
    "memory": 4096,
    "name": "numcross-image",
    "networkMode": "awsvpc",
    "portMappings": [
      {
        "containerPort": 3001,
        "hostPort": 3001
      }
    ]
  }
]
DEFINITION
}

resource "aws_security_group" "numcross_task_security" {
  name        = "numcross_task_security"
  vpc_id      = aws_vpc.default.id

  ingress {
    protocol        = "tcp"
    from_port       = 3001
    to_port         = 3001
    security_groups = [aws_security_group.numcross_lb_security_group.id]
  }

  egress {
    protocol    = "-1"
    from_port   = 0
    to_port     = 0
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_cluster" "numcross_cluster" {
  name = "numcross-cluster"
}

resource "aws_ecs_service" "numcross_ecs_service" {
  name            = "numcross-service"
  cluster         = aws_ecs_cluster.numcross_cluster.id
  task_definition = aws_ecs_task_definition.numcross_ecs_task.arn
  desired_count   = var.app_count
  launch_type     = "FARGATE"

  network_configuration {
    security_groups = [aws_security_group.numcross_task_security.id]
    subnets         = aws_subnet.private.*.id
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.numcross_target_group.id
    container_name   = "numcross-image"
    container_port   = 3001
  }

  depends_on = [aws_lb_listener.numcross_listener]
}
