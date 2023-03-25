output "load_balancer_ip" {
  value = aws_lb.numcross_lb.dns_name
}
