import Joi from "joi";

export interface TitlePlot {
  title: string;
}

const TitlePlotSchema = Joi.object<TitlePlot>({
  title: Joi.string().min(3),
});

export default TitlePlotSchema;
