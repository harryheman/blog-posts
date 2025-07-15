module "instance" {
  source = "./modules/tf-yc-instance"
  subnet_id = module.network.subnet_ids[var.zone]
}

module "network" {
  source = "./modules/tf-yc-network"
}

output "external_ip" {
  value = module.instance.external_ip
}

output "internal_ip" {
  value = module.instance.internal_ip
}

output "network_id" {
  value = module.network.network_id
}

output "subnet_ids" {
  value = module.network.subnet_ids
}
