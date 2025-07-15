resource "yandex_compute_instance" "vm-1" {
  name        = var.resource_name
  platform_id = var.platform_id

  resources {
    cores  = var.cpu_cores
    memory = var.memory_size
  }

  boot_disk {
    initialize_params {
      image_id = var.image_id
      size     = var.disk_size
    }
  }

  network_interface {
    subnet_id = var.subnet_id
    nat       = var.enable_nat
  }

  scheduling_policy {
    preemptible = var.preemptible
  }

  metadata = {
    user-data = "${file(var.user_data_file)}"
    # Альтернатива - ssh-keys = "ansible:${file("~/.ssh/id_rsa.pub")}"
  }
}
