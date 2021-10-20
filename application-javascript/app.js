"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = require("../../test-application/javascript/CAUtil.js");
const {
  buildCCPOrg1,
  buildWallet,
} = require("../../test-application/javascript/AppUtil.js");
const crypto = require("crypto");
const fs = require("fs");
const util = require("util");
const { use } = require("express/lib/router");

const channelName = "mychannel";
const chaincodeName = "hcs2";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
  try {
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(
      FabricCAServices,
      ccp,
      "ca.org1.example.com"
    );
    const wallet = await buildWallet(Wallets, walletPath);
    await enrollAdmin(caClient, wallet, mspOrg1);
    await registerAndEnrollUser(
      caClient,
      wallet,
      mspOrg1,
      org1UserId,
      "org1.department1"
    );
    // a user that has been verified.
    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: org1UserId,
        discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
      });

      // Build a network instance based on the channel where the smart contract is deployed
      const network = await gateway.getNetwork(channelName);

      // Get the contract from the network.
      const contract = network.getContract(chaincodeName);
      // create server
      ////////////////////////////////

      const express = require("express");
      const cookieParser = require("cookie-parser");
      const fileUpload = require("express-fileupload");
      const sha256 = require("sha256")
      const path = require("path");
      const crypto = require("crypto");
      const fs = require("fs");
      const util = require("util");
      const app = express();
  
      const port = 3000;
      app.use(cookieParser());
      app.use(
        fileUpload({
          useTempFiles: true,
          tempFileDir: "tmp/",
          createParentPath: true,
          // preserveExtension:true
        })
      );
      app.use(express.urlencoded({ extended: false }));
      app.use(express.json());
      app.use(express.static("public"));



      app.post("/create-patient", async function (req, res) {
        const { email, password, name, address, diagnosis } = req.body;
        console.log(email, password, name, address, diagnosis);
        const key = `patient_${email}`;
        try {
          let result = await contract.evaluateTransaction(
            "CreatePatient", key, email,
            sha256(password), name, address, diagnosis
          );
          await contract.submitTransaction(
            "CreatePatient", key, email,
            sha256(password), name, address, diagnosis
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          res.status(400).send(error.toString());
        }
      });

      app.post("/create-doctor", async function (req, res) {
        const { email, password, name, qualification, salary } = req.body;
        console.log(email, password, name, qualification, salary);
        const key = `doctor_${email}`;
        try {
          let result = await contract.evaluateTransaction(
            "CreateDoctor", key, email,
            sha256(password), name, qualification, salary
          );
          await contract.submitTransaction(
            "CreateDoctor", key, email,
            sha256(password), name, qualification, salary
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          res.status(400).send(error.toString());
        }
      });

      app.post("/create-pharmacy", async function (req, res) {
        const { name } = req.body;
        const key = `pharmacy_${name}`;
        try {
          let result = await contract.evaluateTransaction(
            "CreatePharmacy", key, name
          );
          await contract.submitTransaction(
            "CreatePharmacy", key, name
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          res.status(400).send(error.toString());
        }
      });


      app.post("/create-lab", async function (req, res) {
        // const {name} = req.body;
        const key = `lab_${sha256("key")}`;
        try {
          let result = await contract.evaluateTransaction(
            "CreateLab", key
          );
          await contract.submitTransaction(
            "CreateLab", key
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          res.status(400).send(error.toString());
        }
      });


      //helper function
      async function sha(filePath) {
        const readFile = util.promisify(fs.readFile);
        const data = await readFile(filePath);
        const hash = crypto.createHash("sha256");
        hash.update(data);
        return hash.digest("base64");
      }

      app.post("/prescription", async function (req, res) {
        const { patientKey, uploaderKey } = req.body;
        //facilated file upload
        const uploadedFile = req.files?.uploadedFile;
        if (uploadedFile === undefined) {
          return res.status(400).send("You must upload a file...");
        }
        const fileName = uploadedFile.name;
        const fileDestination = path.join(
          __dirname,
          "public",
          "uploadedFiles",
          fileName
        );
        console.log(path.join("public", "uploadedFiles", fileName));
        uploadedFile.mv(fileDestination, async (error) => {
          if (error !== undefined) {
            return res
              .status(500)
              .send(`Server error. Failed to move file ${error}...`);
          }
          try {
            const downloadLink = path.join("uploadedFiles", fileName);

            // const user = JSON.parse(req.cookies.user.toString());
            // let uploaderKey = uploaderKey;
            const key = `pres_${uploaderKey}_${fileName}`;
            const fileHash = await sha(fileDestination);
            let result = await contract.evaluateTransaction(
              "CreatePrescription",
              key, fileName, downloadLink,
              patientKey, fileHash,
              uploaderKey
            );
            await contract.submitTransaction(
              "CreatePrescription",
              key, fileName, downloadLink,
              patientKey, fileHash,uploaderKey
            );
            res.send(JSON.parse(result.toString()));
          } catch (error) {
            return res.status(400).send(error.toString());
          }
        });
      });

     
      app.post("/Share", async function (req, res) {
        const { presKey, sharedWithKey } = req.body;
        const key = `SharePres_${presKey}_${sharedWithKey}`;
        try {
          let result = await contract.evaluateTransaction(
            "SharePrescription",
            key,presKey,sharedWithKey
          );
          await contract.submitTransaction(
            "SharePrescription",
            key,presKey,sharedWithKey
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          res.status(400).send(error.toString());
        }
      });

      app.get("/fileSharePres", async function (req, res) {
        const { presShareKey} = req.body;
        try {
          let result = await contract.evaluateTransaction(
            "FindSharedPres",
            presShareKey
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          return res.status(400).send(error.toString());
        }
      });

      app.get("/PatientPres", async function (req, res) {
        const { PatientKey } = req.body;
        try {
          let result = await contract.evaluateTransaction(
            "FindPrescriptionByPatient",
            PatientKey
          );
          res.send(JSON.parse(result.toString()));
        } catch (error) {
          return res.status(400).send(error.toString());
        }
      });

     
      app.listen(port, () => {
        console.log(`Server listening at http://localhost:${port}`);
      });

      //////////////////////////////////
    } finally {
      // gateway.disconnect();
    }
  } catch (error) {
    console.error(`******** FAILED to run the application: ${error}`);
  }
}

main();
