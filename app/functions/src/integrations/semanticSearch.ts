import * as admin from "firebase-admin";
import axios from "axios";

export const callSemanticSearch = async (query: string) => {
  if (!query || query.length === 0) {
    // If the query is empty or undefined, return an empty array
    return [];
  }

  // Get the project id from the firebase-admin
  const { projectId } = admin.instanceId().app.options;
  // Call the semantic search function from cloud functions
  const url = `https://us-central1-${projectId}.cloudfunctions.net/ext-firestore-semantic-search-queryIndex`;
  const result = await axios.post(url, { data: { query: [query] } });

  return result.data.result.data.nearestNeighbors[0].neighbors;
};
