export const getStrWithMarkers = (str: string, creationID?: string, sceneIndex?: number): string => {
  const creationIdText = creationID ? `Creation ID: ${creationID}. ` : "";
  const sceneText = sceneIndex ? `Scene Index: ${sceneIndex}. ` : "";
  return `${creationIdText}${sceneText}${str}`;
};
