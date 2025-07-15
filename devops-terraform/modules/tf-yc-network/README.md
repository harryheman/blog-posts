# Terraform Yandex.Cloud Network Module

Этот модуль Terraform создает VPC-сеть и получает список доступных подсетей в Yandex.Cloud.

---

## Зависимости

- Terraform 1.5.7
- Yandex.Cloud Terraform Provider >= 0.87.0
- Аккаунт в Yandex.Cloud с доступом к управлению сетью

---

## Провайдер

```hcl
terraform {
  required_providers {
    yandex = {
      source  = "yandex-cloud/yandex"
      version = ">= 0.87.0"
    }
  }
}

provider "yandex" {
  cloud_id  = var.cloud_id
  folder_id = var.folder_id
  zone      = var.zone
}
```

---

## Переменные модуля

| Имя переменной  | Описание                | Тип           | Дефолтное значение                                    |
|-----------------|-------------------------|---------------|-------------------------------------------------------|
| `network_zones` | Список зон для подсетей | `set(string)` | `["ru-central1-a", "ru-central1-b", "ru-central1-c"]` |

---

## Возвращаемые значения (outputs)

| Имя переменной | Описание                              |
|----------------|---------------------------------------|
| `network_id`   | ID созданной сети                     |
| `subnet_ids`   | Список ID созданных подсетей по зонам |
