import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { RESUME_MIN_LENGTH } from "../../constants/resume.constant.js";

const schema = Joi.object({
  resumeTitle: Joi.string().required().messages({
    "any.required": MESSAGES.RESUMES.COMMON.TITLE.REQUIRED,
  }),
  resumeContent: Joi.string().required().min(RESUME_MIN_LENGTH).messages({
    "any.required": MESSAGES.RESUMES.COMMON.CONTENT.REQUIRED,
    "string.min": MESSAGES.RESUMES.COMMON.CONTENT.MIN_LENGTH,
  }),
});

export const createResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
