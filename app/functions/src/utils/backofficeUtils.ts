export const buildVideoUrl = (videoId: string): string => {
  let host;
  const projectId = process.env.PABOLO_PROJECT_ID;
  if (!projectId || projectId.includes("prod")) {
    // redirect to pabolo.ai in production
    host = "pabolo.ai";
  } else {
    host = `${projectId}.web.app`;
  }

  return `https://${host}/video/${videoId}`;
};
