variable "resource_name" {
  description = "Имя виртуальной машины"
  type        = string
  default     = "my-vm"
}

variable "platform_id" {
  description = "Платформа виртуальной машины"
  type        = string
  default     = "standard-v3"
}

variable "cpu_cores" {
  description = "Количество ядер процессора"
  type        = number
  default     = 2
}

variable "memory_size" {
  description = "Объем оперативной памяти (в ГБ)"
  type        = number
  default     = 2
}

variable "image_id" {
  description = "ID образа диска"
  type        = string
  default     = "fd80qm01ah03dkqb14lc"
}

variable "disk_size" {
  description = "Размер диска (в ГБ)"
  type        = number
  default     = 50
}

variable "enable_nat" {
  description = "Включить NAT для ВМ"
  type        = bool
  default     = true
}

variable "preemptible" {
  description = "Использовать прерываемую ВМ"
  type        = bool
  default     = true
}

variable "user_data_file" {
  description = "Путь к файлу с данными пользователей"
  type        = string
  default     = "./user-data.txt"
}

variable "subnet_id" {
  type = string
}
