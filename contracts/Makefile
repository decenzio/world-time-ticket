SHELL := /bin/bash
ENV_FILE := .env
CONTRACT := src/WorldTimeTicketEscrow.sol:WorldTimeTicketEscrow

.PHONY: help build deploy deploy-dry balance

help:
	@echo "Makefile for contract deployments (contracts/Makefile)"
	@echo "Targets: build, deploy, deploy-dry, balance"

build:
	forge build

deploy-dry:
	@if [ ! -f $(ENV_FILE) ]; then echo "$(ENV_FILE) not found"; exit 1; fi
	@set -a; . $(ENV_FILE); set +a; \
	 echo forge create $(CONTRACT) --rpc-url "$$RPC_URL" --private-key "$$PRIVATE_KEY" --constructor-args "$$OWNER"

deploy:
	@if [ ! -f $(ENV_FILE) ]; then echo "$(ENV_FILE) not found"; exit 1; fi
	@set -a; . $(ENV_FILE); set +a; \
	 echo "Deploying $(CONTRACT) via $$RPC_URL..."; \
	 forge create $(CONTRACT) --rpc-url "$$RPC_URL" --private-key "$$PRIVATE_KEY" --constructor-args "$$OWNER"

balance:
	@if [ ! -f $(ENV_FILE) ]; then echo "$(ENV_FILE) not found"; exit 1; fi
	@set -a; . $(ENV_FILE); set +a; \
	 echo "Owner $$OWNER balance:"; \
	 cast balance "$$OWNER" --rpc-url "$$RPC_URL"
