## What is rvm1-ansible? [![Build Status](https://secure.travis-ci.org/rvm/rvm1-ansible.png)](http://travis-ci.org/rvm/rvm1-ansible)

It is an [Ansible](http://www.ansible.com/home) role to install and manage ruby versions using rvm.

### Why should you use rvm?

In production it's useful because compiling a new version of ruby can easily
take upwards of 10 minutes. That's 10 minutes of your CPU being pegged at 100%.

rvm has pre-compiled binaries for a lot of operating systems. That means you can
install ruby in about 1 minute, even on a slow micro instance.

This role even adds the ruby binaries to your system path when doing a system
wide install. This allows you to access them as if they were installed without
using a version manager while still benefiting from what rvm has to offer.

## Installation

`$ ansible-galaxy install rvm_io.rvm1-ruby`

## Role variables

Below is a list of default values that you can configure:

```
---

# Install 1 or more versions of ruby
rvm1_rubies:
  - 'ruby-2.1.3'

# Delete a specific version of ruby (ie. ruby-2.1.0)
rvm1_delete_ruby:

# Install path for rvm (defaults to system wide)
rvm1_install_path: '/usr/local/rvm'

# Add or remove any install flags
# NOTE: If you are doing a USER BASED INSTALL then
#       make sure you ADD the --user-install flag below
rvm1_install_flags: '--auto-dotfiles'

# Add additional ruby install flags
rvm1_ruby_install_flags:

# Set the owner for the rvm directory
rvm1_user: 'root'

# URL for the latest installer script
rvm1_rvm_latest_installer: 'https://raw.githubusercontent.com/wayneeseguin/rvm/master/binscripts/rvm-installer'

# rvm version to use
rvm1_rvm_version: 'stable'

# Check and update rvm, disabling this will force rvm to never update
rvm1_rvm_check_for_updates: True

# GPG key verification, use an empty string if you want to skip this
# Note: Unless you know what you're doing, just keep it as is
#           Identity proof: https://keybase.io/mpapis
#           PGP message: https://rvm.io/mpapis.asc
rvm1_gpg_keys: 'D39DC0E3'

# The GPG key server
rvm1_gpg_key_server: 'hkp://keys.gnupg.net'

# autolib mode, see https://rvm.io/rvm/autolibs
rvm1_autolib_mode: 3
```

## Example playbook

```
---

- name: Configure servers with ruby support
  hosts: all

  roles:
    - { role: rvm_io.rvm1-ruby, tags: ruby, sudo: True }
```

#### System wide installation

The above example would setup ruby system wide. It's very important that you
run the play with sudo because it will need to write to `/usr/local/rvm`.

#### To the same user as `ansible_ssh_user`

In this case, just overwrite `rvm_install_path` and set the `--user-install` flag:

**Note:** you still need to use sudo because during the ruby
  installation phase rvm will internally make calls using sudo
  to install certain ruby dependencies.

```
rvm1_install_flags: '--auto-dotfiles --user-install'
rvm1_install_path: '/home/{{ ansible_ssh_user }}/.rvm'
```

#### To a user that is not `ansible_ssh_user`

You **will need sudo here** because you will be writing outside the ansible
user's home directory. Other than that it's the same as above, except you will
supply a different user account:

```
rvm1_install_flags: '--auto-dotfiles --user-install'
rvm1_install_path: '/home/someuser/.rvm'
```

#### A quick note about `rvm1_user`

In some cases you may want the rvm folder and its files to be owned by a specific
user instead of root. Simply set `rvm1_user: 'foo'` and when ruby gets installed
it will ensure that `foo` owns the rvm directory.

## Upgrading and removing old versions of ruby

A common work flow for upgrading your ruby version would be:

1. Install the new version
2. Run your application role so that bundle install re-installs your gems
3. Delete the previous version of ruby

### Leverage ansible's `--extra-vars`

Just add `--extra-vars 'rvm1_delete_ruby=ruby-2.1.0'` to the end of your play book command and that version will be removed.

## Requirements

- Tested on ubuntu 12.04 LTS but it should work on other versions that are similar.
- Tested on RHEL6.5 and CentOS 6.5

## Ansible galaxy

You can find it on the official [ansible galaxy](https://galaxy.ansible.com/list#/roles/1087) if you want to rate it.

## License

MIT
