all: build

HOME_DIR=/home/h4ci1
BUILD_BRANCH ?= master

.PHONY: prepare
.ONESHELL:
prepare:
	sudo yum install -y ansible
	sudo yum install -y which
	sudo chown -R h4ci1:h4ci1 $(HOME_DIR)/builder-setup
	sudo yum groupinstall -y "Development Tools"
	sudo yum install -y epel-release
	sudo yum -y update || echo ''

.PHONY: build
build: prepare
	ansible-playbook $(HOME_DIR)/builder-setup/ansible/playbooks/pdf_printer_build_pkgr.yml -i $(HOME_DIR)/builder-setup/ansible/inventory/builder -vvv -e "web_default_user=`whoami` build_branch=${BUILD_BRANCH} " -c local

.PHONY: deliver
deliver:
	jfrog rt upload "pdf_printer_rpms/*.rpm" acceptance-rpm-local/7/x86_64/ --build-name=${JOB_NAME} --build-number=${BUILD_NUMBER}
	jfrog rt build-publish ${JOB_NAME} ${BUILD_NUMBER}
	sudo chmod -R 0777 pdf_printer_rpms

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
