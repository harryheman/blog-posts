output "external_ip" {
  description = "Внешний IP-адрес виртуальной машины"
  value       = yandex_compute_instance.vm-1.network_interface.0.nat_ip_address
}

output "internal_ip" {
  description = "Внутренний IP-адрес виртуальной машины"
  value       = yandex_compute_instance.vm-1.network_interface.0.ip_address
}
