import * as admin from "firebase-admin";

// Import microservices modules
import AccountMicroService from "./microservices/account";
import KitchenMicroService, { KitchenPubSub } from "./microservices/kitchen";
import { reports } from "./modules/reports";
import { creations } from "./modules/creations";
import { backoffice } from "./modules/backoffice";
import { videos } from "./modules/videos";

// Import other modules
import * as logs from "./modules/logs";
import { sendNetzdgEmail } from "./modules/netzdg";

import * as users from "./event-triggers/users";
import { updateSearch } from "./event-triggers/videos";
import { cleanUpTestUsers } from "./scheduled-functions/cleanUpTestUsers";

// Import utils
import { prependRev, validateProjectId } from "./utils/utils";

// use the service account key as the functions credentials
if (process.env.SA_CREDENTIALS && process.env.SA_CREDENTIALS !== "undefined") {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = process.env.SA_CREDENTIALS;
}

admin.initializeApp();

validateProjectId();

exports.addUser = users.addUser;

exports.sendWelcomeEmail = users.sendWelcomeEmail;

exports.deleteUser = users.deleteUser;

// Export Report module functions
exports[prependRev("reports")] = reports;

// Export Backoffice module functions
exports[prependRev("backoffice")] = backoffice;

// Export Creations module functions
exports[prependRev("creations")] = creations;

// Kitchen Gen2 microservice
exports[prependRev("kitchen")] = KitchenMicroService;
exports[prependRev("kitchen_pubsub")] = KitchenPubSub;

// Export videos module functions
exports[prependRev("videos")] = videos;

// Export NetzDG module functions
exports[prependRev("sendNetzdgEmail")] = sendNetzdgEmail;

// Export account microservice
exports[prependRev("account")] = AccountMicroService;

// Export Scheduled module functions
exports.cleanUpTestUsers = cleanUpTestUsers;

// Export Event Triggers module functions
exports.updateSearch = updateSearch;

// Export Logs module functions
exports.logClientCrash = logs.logClientCrash;
