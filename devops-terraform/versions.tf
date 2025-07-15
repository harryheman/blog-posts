terraform {
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = ">= 0.87.0"
    }
  }

  # Хранение состояния Terraform (terraform.tfstate) в бакете (bucket) Yandex Cloud
  # backend "s3" {
  #   endpoint = "https://storage.yandexcloud.net"
  #   bucket   = "terraform-state"
  #   region   = "ru-central1"
  #   key      = "terraform.tfstate"

  #   skip_region_validation      = true
  #   skip_credentials_validation = true
  # }
}
