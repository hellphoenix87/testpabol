import { exec } from "child_process";

const execWithPromise = async (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const getLocalToken = async (): Promise<string> => {
  return (await execWithPromise("gcloud auth print-identity-token")).trim();
};
