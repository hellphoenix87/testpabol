import Joi from "joi";

export interface Netzdg {
  email: string;
  affiliation: string;
  issueType: string;
  contentUrl: string;
  description: string;
  signature: string;
}

const NetzdgSchema = Joi.object<Netzdg>({
  email: Joi.string().email().required(),
  affiliation: Joi.string().required(),
  issueType: Joi.string().required(),
  contentUrl: Joi.string().required(),
  description: Joi.string().required(),
  signature: Joi.string().required(),
});

export default NetzdgSchema;
