

'use strict';

const { Contract } = require('fabric-contract-api');

class HealthCare extends Contract {
    async CreatePatient(ctx, key, email, password, name, pAddress, patientDiagnosis) {
        const patient = {
            key: key,
            email: email,
            password: password,
            name: name,
            pAddress: pAddress,
            patientDiagnosis: patientDiagnosis,
            docType: 'patient'
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
        return JSON.stringify(patient);
    }

    // async FindPatient(ctx,key) {
    //     const patientJSON = await ctx.stub.getState(key); // get the user from chaincode state
    //     if (!patientJSON || patientJSON.length === 0) {
    //         throw new Error(`The asset ${key} does not exist`);
    //     }
    //     return patientJSON.toString();
    // }

    async CreateDoctor(ctx, key, email, password, dname, qualification, salary) {
        const doctor = {
            key: key,
            email: email,
            password: password,
            dname: dname,
            qualification: qualification,
            salary: salary,
            docType: 'doctor'
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(doctor)));
        return JSON.stringify(doctor);
    }

    // async FindDoctor(ctx,key) {
    //     const doctorJSON = await ctx.stub.getState(key); // get the user from chaincode state
    //     if (!doctorJSON || doctorJSON.length === 0) {
    //         throw new Error(`The doctor ${key} does not exist`);
    //     }
    //     return doctorJSON.toString();
    // }

    async CreatePharmacy(ctx, key,pname) {
        const pharmacy = {
            key: key,
            pname:pname,
            docType: 'pharmacy'
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(pharmacy)));
        return JSON.stringify(pharmacy);
    }

    // async FindPharmacy(ctx,key) {
    //     const pharmacyJSON = await ctx.stub.getState(key); // get the user from chaincode state
    //     if (!pharmacyJSON || pharmacyJSON.length === 0) {
    //         throw new Error(`The doctor ${key} does not exist`);
    //     }
    //     return pharmacyJSON.toString();
    // }
    async CreateLab(ctx, key) {
        const pharmacy = {
            key: key,
            docType: 'lab'
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(pharmacy)));
        return JSON.stringify(pharmacy);
    }

    // async FindLab(ctx,key) {
    //     const labJSON = await ctx.stub.getState(key); // get the user from chaincode state
    //     if (!labJSON || labJSON.length === 0) {
    //         throw new Error(`The doctor ${key} does not exist`);
    //     }
    //     return labJSON.toString();
    // }

    async CreatePrescription(ctx, key,pName, downloadLink, patientKey, fileHash, uploaderKey) {
        const prescription = {
            key: key,
            presName:pName,
            downloadLink: downloadLink,
            patientKey: patientKey,
            fileHash: fileHash,
            uploaderKey: uploaderKey,
            docType: 'prescription',
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(prescription)));
        return JSON.stringify(prescription);
    }

    // async FindPrescription(ctx, key) {
    //     const presJSON = await ctx.stub.getState(key);
    //     if (!presJSON || presJSON.length === 0) {
    //         throw new Error(`The prescription with ${key} does not exist`);
    //     }
    //     return presJSON.toString();
    // }

    async SharePrescription(ctx, key, prescriptionKey, sharedWithKey) {
        const PresShare = {
            key: key,
            prescriptionKey: prescriptionKey,
            SharedWithKey: sharedWithKey,
            DocType: 'presShare',
        };
        await ctx.stub.putState(key, Buffer.from(JSON.stringify(PresShare)));
        return JSON.stringify(PresShare);
    }

    async FindSharedPres(ctx, presShareKey) {
        const presShareJSON = await ctx.stub.getState(presShareKey); // get the asset from chaincode state
        if (!presShareJSON || presShareJSON.length === 0) {
            throw new Error(`The pres with ${presShareKey} does not exist`);
        }
        return presShareJSON.toString();
    }

    async FindPrescriptionByPatient(ctx, key) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'prescription';
        queryString.selector.patientKey = key;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    }

    

    async GetQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        let results = await this._GetAllResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    async _GetAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    jsonRes.Key = res.value.key;
                    try {
                        jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }

}

module.exports = HealthCare;
