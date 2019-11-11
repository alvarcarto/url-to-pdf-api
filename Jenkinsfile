#!groovy
@Library('step-jenkins-shared-library')_


// Build Info
def buildInfo

pipeline {
    agent {
        label 'master'
    }

    options {
        ansiColor('xterm')
    }

    environment {
        SLACK_TOKEN = getSlackToken()
    }

    stages {
        stage('Initialize Build Info') {
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
                        docker build -f Dockerfiel -t pdfy:${dockerImgVersion} .
                    """
                }
            }
            post {
                failure {
                    ex_sendSlackNotification(msg: "Error building Pdfy Docker image", status: "FAILURE")
                }
            }
        }
        stage("Push and Scan Image") {
            agent {
                label 'ec2cloud'
            }
            steps {
                script {
                    def dockerImgVersion = ex_retrieveAppVersion()
                    ex_rtPushImage(imgVersion:dockerImgVersion, exportFromFile: false, appName: 'step-enablement-pdfy', dockerImgName: 'pdfy', buildInfo: buildInfo)

                    // Call shared library script for pushing to Artifactory
                    ex_rtPublishBuildInfo(buildInfo)

                    xrayScanResult = ex_rtScanImage(buildInfo: buildInfo, failBuild: false, disableResultUpload: false)
                    print xrayScanResult
                }
            }
            post {
                failure {
                    ex_sendTeamsNotification(msg:"Failed pushing/scanning of Docker image to Artifactory", status:"FAILURE")
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
