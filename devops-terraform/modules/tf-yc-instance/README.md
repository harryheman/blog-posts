# Terraform Yandex.Cloud Compute Module

Этот модуль Terraform предназначен для создания виртуальной машины (ВМ) в Yandex.Cloud с заданными параметрами.

## Зависимости для работы модуля

- Terraform 1.5.7
- Yandex.Cloud Terraform Provider >= 0.87
- Аккаунт в Yandex.Cloud с доступом к управлению ВМ
- Сеть и подсеть в Yandex.Cloud

## Провайдер

```hcl
terraform {
  required_providers {
    yandex = {
      source =  "yandex-cloud/yandex"
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

| Имя переменной   | Описание                             | Тип      | Дефолтное значение       |
|------------------|--------------------------------------|----------|--------------------------|
| `resource_name`  | Имя виртуальной машины               | `string` | `"my-vm"`                |
| `platform_id`    | Платформа виртуальной машины         | `string` | `"standard-v3"`          |
| `cpu_cores`      | Количество ядер процессора           | `number` | `2`                      |
| `memory_size`    | Объем оперативной памяти (в ГБ)      | `number` | `2`                      |
| `image_id`       | ID образа диска                      | `string` | `"fd80qm01ah03dkqb14lc"` |
| `disk_size`      | Размер диска (в ГБ)                  | `number` | `50`                     |
| `enable_nat`     | Включить NAT для ВМ                  | `bool`   | `true`                   |
| `preemptible`    | Использовать прерываемую ВМ          | `bool`   | `true`                   |
| `user_data_file` | Путь к файлу с данными пользователей | `string` | `"./user-data.txt"`      |

---

## Возвращаемые значения (outputs)

| Имя переменной | Описание                               |
|----------------|----------------------------------------|
| `external_ip`  | Внешний IP-адрес виртуальной машины    |
| `internal_ip`  | Внутренний IP-адрес виртуальной машины |
