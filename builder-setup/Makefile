all: build

HOME_DIR=/home/h4ci1
BUILD_BRANCH ?= master
PROMOTE_BRANCH ?= master

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
	ansible-playbook $(HOME_DIR)/pdf-printer-build/builder-setup/ansible/playbooks/pdf_printer_build_pkgr.yml -i $(HOME_DIR)/pdf-printer-build/builder-setup/ansible/inventory/builder -vvv -e "web_default_user=`whoami` build_branch=${BUILD_BRANCH} build_version=${VERSION}" -c local

.PHONY: deliver
deliver:
	jfrog rt upload "rpms/pdf_printer_$(VERSION)*.rpm" acceptance-local/pdf_printer/ --build-name=${JOB_NAME} --build-number=${BUILD_NUMBER} --flat=true --fail-no-op=true
	jfrog rt build-publish ${JOB_NAME} ${BUILD_NUMBER}

.PHONY: promote
promote:
	jfrog rt cp "acceptance-local/pdf_printer/pdf_printer_$(VERSION)*.rpm" union-local/pdf_printer/$(PROMOTE_BRANCH)/

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-25s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
