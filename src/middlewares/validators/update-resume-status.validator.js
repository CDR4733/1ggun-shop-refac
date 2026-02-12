import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { RESUME_STATUS } from "../../constants/resume.constant.js";

const schema = Joi.object({
  resumeStatus: Joi.string()
    .required()
    .valid(...Object.values(RESUME_STATUS))
    .messages({
      "any.required": MESSAGES.RESUMES.UPDATE.STATUS.FAIL.NO_STATUS,
      "any.only": MESSAGES.RESUMES.UPDATE.STATUS.FAIL.INVALID_STATUS, // .valid() <-> any.only
    }),
  reason: Joi.string().required().messages({
    "any.required": MESSAGES.RESUMES.UPDATE.STATUS.FAIL.NO_REASON,
  }),
});
export const updateResumeStatusValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
