import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { RESUME_MIN_LENGTH } from "../../constants/resume.constant.js";

const schema = Joi.object({
  resumeTitle: Joi.string(),
  resumeContent: Joi.string().min(RESUME_MIN_LENGTH).messages({
    "string.min": MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
  }),
})
  .min(1) // object 자체에 .min() : 둘 중 하나는 최소한 있어야 한다.
  .messages({
    "object.min": MESSAGES.RESUMES.UPDATE.FAIL.NO_DATA,
  });
export const updateResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
