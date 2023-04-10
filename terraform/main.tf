#Define providers used
locals {
  subscription_id = "fb5e8e16-ea56-45cc-88b0-07aa66210f1b"
}

provider "azurerm" {
  subscription_id = local.subscription_id
  features {} #This is required for v2 of the provider even if empty or plan will fail
}

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.92.0"
    }
  }
}

data "azurerm_resource_group" "ResGroup" {
  name = "Alex-RG"
}

#Resource section
resource "azurerm_storage_account" "StorAccount1" {
  name                     = "alexstorageivan"
  resource_group_name      = data.azurerm_resource_group.ResGroup.name
  location                 = data.azurerm_resource_group.ResGroup.location
  account_kind             = "StorageV2"
  account_tier             = "Standard"
  account_replication_type = var.replicationType
}

resource "azurerm_storage_container" "Input" {
  name                  = "input"
  storage_account_name  = azurerm_storage_account.StorAccount1.name
  container_access_type = "private"
}


resource "azurerm_cosmosdb_account" "db" {
  name                = "alexmongodbivan"
  resource_group_name = data.azurerm_resource_group.ResGroup.name
  location            = data.azurerm_resource_group.ResGroup.location
  offer_type          = "Standard"
  kind                = "MongoDB"

  enable_automatic_failover = true

  capabilities {
    name = "EnableAggregationPipeline"
  }

  capabilities {
    name = "mongoEnableDocLevelTTL"
  }

  capabilities {
    name = "MongoDBv3.4"
  }

  capabilities {
    name = "EnableMongo"
  }

  consistency_policy {
    consistency_level       = "BoundedStaleness"
    max_interval_in_seconds = 300
    max_staleness_prefix    = 100000
  }

  geo_location {
    location          = "eastus"
    failover_priority = 1
  }

  geo_location {
    location          = "westus"
    failover_priority = 0
  }
}

resource "azurerm_cosmosdb_mongo_database" "db-alex" {
  name                = "alex-cosmos-mongo-db"
  resource_group_name = data.azurerm_resource_group.ResGroup.name
  account_name        = resource.azurerm_cosmosdb_account.db.name
  throughput          = 400
}

resource "azurerm_app_service_plan" "sPlan" {
  name                = "alex-service-plan-ivan"
  resource_group_name = data.azurerm_resource_group.ResGroup.name
  location            = data.azurerm_resource_group.ResGroup.location

  sku {
    tier = "Basic"
    size = "B1"
  }
}

resource "azurerm_function_app" "example" {
  name                       = "alex-functionapp-container-ivan"
  resource_group_name        = data.azurerm_resource_group.ResGroup.name
  location                   = data.azurerm_resource_group.ResGroup.location
  app_service_plan_id        = resource.azurerm_app_service_plan.sPlan.id
  storage_account_name       = resource.azurerm_storage_account.StorAccount1.name
  storage_account_access_key = resource.azurerm_storage_account.StorAccount1.primary_access_key
	app_settings = {
		COSMOS_DB_NAME = resource.azurerm_cosmosdb_mongo_database.db-alex.name
		COSMOS_DB_URL = resource.azurerm_cosmosdb_account.db.connection_strings[0]
	}
}