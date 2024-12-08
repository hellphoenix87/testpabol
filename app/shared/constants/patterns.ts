export const socialMediaPattern = /^@?[A-Za-z0-9_]{1,15}$/;
export const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

const protocol = "(https?:\\/\\/)?";
const subDomain = "(?:[a-zA-Z0-9]+\\.)?";
const domain = "(([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]|[a-zA-Z0-9]+)\\.)+";
const topDomain = "(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]|[a-zA-Z0-9]){2,})";
const path = "(\\/.*)?";
export const webPattern = new RegExp(`^${protocol}${subDomain}${domain}${topDomain}${path}$`);
