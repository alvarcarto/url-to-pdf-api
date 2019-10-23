all: build

HOME_DIR=/home/h4ci1

.PHONY: prepare
.ONESHELL:
prepare:
	sudo yum install -y ansible
	sudo yum install -y which
	sudo chown -R h4ci1:h4ci1 $(HOME_DIR)/pdf-printer-build
	sudo yum groupinstall -y "Development Tools"
	sudo yum install -y epel-release
	sudo yum -y update || echo ''

.PHONY: build
build: prepare
	ansible-playbook $(HOME_DIR)/pdf-printer-build/builder-setup/ansible/playbooks/pdf_printer_build_pkgr.yml -i $(HOME_DIR)/pdf-printer-build/builder-setup/ansible/inventory/builder -v -e "build_version=${VERSION}" -c local

.PHONY: deliver
deliver:
	sha=$(shell git rev-parse HEAD) \
	&& jfrog rt upload "rpms/pdf_printer_$(VERSION)*.rpm" acceptance-local/pdf_printer/ --build-name=${JOB_NAME} --build-number=${BUILD_NUMBER} --flat=true --fail-no-op=true --props "commit=$${sha}"
	jfrog rt build-publish ${JOB_NAME} ${BUILD_NUMBER}

.PHONY: promote
promote:
	jfrog rt cp "acceptance-local/pdf_printer/pdf_printer_$(VERSION)*.rpm" union-local/

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
