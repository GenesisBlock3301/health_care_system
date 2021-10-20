'use strict';

const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../../test-application/javascript/CAUtil.js');
const { buildCCPOrg1, buildWallet } = require('../../test-application/javascript/AppUtil.js');

const channelName = 'mychannel';
const chaincodeName = 'hcs';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}


async function main() {
    try {
        const ccp = buildCCPOrg1();
        const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
        const wallet = await buildWallet(Wallets, walletPath);
        await enrollAdmin(caClient, wallet, mspOrg1);
        await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');
        // a user that has been verified.
        const gateway = new Gateway();

        try {
            await gateway.connect(ccp, {
                wallet,
                identity: org1UserId,
                discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
            });

            // Build a network instance based on the channel where the smart contract is deployed
            const network = await gateway.getNetwork(channelName);

            // Get the contract from the network.
            const contract = network.getContract(chaincodeName);

            ////////////////////////////
            try {
                let result = await contract.evaluateTransaction(
                    'CreatePatient',
                    'patient_nas@gmail.com',
                    'nas@gmail.com',
                    'nas12345',
                    'N A Sifat',
                    "Jamalpur",
                    "Fever"
                );
                await contract.submitTransaction(
                    'CreatePatient',
                    'patient_nas@gmail.com',
                    'nas@gmail.com',
                    'nas12345',
                    'N A Sifat',
                    "Jamalpur",
                    "Fever"
                );
                console.log(`Create patient successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }

            // create doctor

            try {
                let result = await contract.evaluateTransaction(
                    'CreateDoctor',
                    'doctor_doctor@gmail.com',
                    'doctor@gmail.com',
                    'doctor12345',
                    'N A Ahnat',
                    "MBBS",
                    100000
                );
                await contract.submitTransaction(
                    'CreateDoctor',
                    'doctor_doctor@gmail.com',
                    'doctor@gmail.com',
                    'doctor12345',
                    'N A Ahnat',
                    "MBBS",
                    100000
                );
                console.log(`Create Doctor successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }

            // create pharmacy
            try {
                let result = await contract.evaluateTransaction(
                    'CreatePharmacy',
                    "pharmacy_pharmacy",
                    'pharmacy'
                );
                await contract.submitTransaction(
                    'CreatePharmacy',
                    "pharmacy_pharmacy",
                    'pharmacy'
                );
                console.log(`Create Pharmacy successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }

            // create lab

            try {
                let result = await contract.evaluateTransaction(
                    'CreateLab',
                    "lab_key",
                );
                await contract.submitTransaction(
                    'CreateLab',
                    "lab_key",
                );
                console.log(`Create Lab successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }
            // create prescription
            try {
                let result = await contract.evaluateTransaction(
                    'CreatePrescription',
                    "pres_fileHash",
                    "downloadLink",
                    "patient_nas@gmail.com",
                    "fileHash",
                    "doctor_doctor@gmail.com"

                );
                await contract.submitTransaction(
                    'CreatePrescription',
                    "pres_fileHash",
                    "downloadLink",
                    "patient_nas@gmail.com",
                    "fileHash",
                    "doctor_doctor@gmail.com"
                );
                console.log(`Create Prescription successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }

            // find prescription
            try {
                let result = await contract.evaluateTransaction(
                    'FindPrescription',
                    "pres_fileHash",
                );
                console.log(`Find Prescription successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }
            // share prescription with lab
            try {
                let result = await contract.evaluateTransaction(
                    'SharePrescription',
                    "sharePres_prescriptionKey",
                    "pres_fileHash",
                    "lab_key"
                );
                await contract.submitTransaction(
                    'SharePrescription',
                    "sharePres_prescriptionKey",
                    "pres_fileHash",
                    "lab_key"
                );
                console.log(`Create Share Prescription successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }
            // find share prescription
            try {
                let result = await contract.evaluateTransaction(
                    'FindSharedPres',
                    "sharePres_prescriptionKey",
                );
                console.log(`Find Share Prescription successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }
            // find prescription by patient

            try {
                let result = await contract.evaluateTransaction(
                    'FindPrescriptionByPatient',
                    "patient_nas@gmail.com",
                );
                console.log(`Find Share Prescription successfully\n, ${result}`);
            } catch (error) {
                console.log(`*** Successfully caught the error: \n    ${error}`);
            }

        } finally {
            gateway.disconnect();
        }
    } catch (error) {
        console.error(`******** FAILED to run the application: ${error}`);
    }
}

main();
