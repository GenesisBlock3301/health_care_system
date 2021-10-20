/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const HealthCare = require('./lib/hcs');

module.exports.HealthCare = HealthCare;
module.exports.contracts = [HealthCare];
