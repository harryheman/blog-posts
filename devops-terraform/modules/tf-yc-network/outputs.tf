output "network_id" {
  description = "ID созданной сети"
  value       = data.yandex_vpc_network.default.id
}

output "subnet_ids" {
  description = "ID созданных подсетей"
  value       = { for zone, subnet in data.yandex_vpc_subnet.default : zone => subnet.id }
}
