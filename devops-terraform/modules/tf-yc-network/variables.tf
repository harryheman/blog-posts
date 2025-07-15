variable "network_zones" {
  description = "Список зон для создания подсетей"
  type        = set(string)
  default     = ["ru-central1-a", "ru-central1-b", "ru-central1-d"]
}
