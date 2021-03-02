#!groovy
@Library('step-jenkins-shared-library')_


// Build Info
def buildInfo

pipeline {
    agent { label 'ec2cloud' }

    options {
        ansiColor('xterm')
    }

    environment {
        SLACK_TOKEN = getSlackToken()
    }

    stages {
        stage('Initialize Build Info') {
            agent {
                label 'ec2cloud'
            }           
            steps {
                script {
                    def dockerImgVersion = ex_retrieveAppVersion()
                    buildName "${BUILD_TIMESTAMP}-"+dockerImgVersion

                    buildInfo = ex_rtSetupBuildInfo(appName: 'step-enablement-pdfy', buildNumber: env.BUILD_DISPLAY_NAME)
                }
            }
        }
        stage('Unit Test and Build STEP Pdfy image') {
            agent {
                label 'ec2cloud'
            }
            steps {
                script{
                    def dockerImgVersion = ex_retrieveAppVersion()
                    // Build Docker image
                    sh """#!/bin/bash -xe
                        docker build -f Dockerfile -t pdfy:${dockerImgVersion} .
                    """
                }
            }
            post {
                failure {
                    ex_sendSlackNotification(msg: "Error building Pdfy Docker image", status: "FAILURE")
                }
            }
        }
        stage("Push to ECR") {
            agent {
                label 'ec2cloud'
            }
            steps {
                script {
                    ex_pushImageToECR(imgVersion: ex_retrieveAppVersion().toString(), exportFromFile: true, exportFile: "infrastructure/jenkins.notices.pre.env")
                }
            }
            post {
                failure {
                    ex_sendSlackNotification(msg: "Push to ECR failed ${FAILURE_ICON} ${COMMIT_DETAILS} ${FAILURE_MSG}", status: "FAILURE")
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}

// return the Slack token from parameter store
def getSlackToken() {
    ex_withSTEPParamStore(path:'/LINZ/STEP/Enablement/') {
        return SLACK_TOKEN
    }
}
