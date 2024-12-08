import Joi from "joi";

export interface VideoReport {
  videoId: string;
  description: string;
}

export const VideoReportSchema = Joi.object<VideoReport>({
  videoId: Joi.string().required(),
  description: Joi.string().min(20).required(),
});
