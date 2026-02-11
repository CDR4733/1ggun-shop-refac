import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": MESSAGES.COMMON.EMAIL.REQUIRED,
    "string.email": MESSAGES.AUTH.SIGN_UP.FAIL.EMAIL.INVALID_FORMAT,
  }),
  password: Joi.string().required().messages({
    "any.required": MESSAGES.COMMON.PASSWORD.REQUIRED,
  }),
});

export const logInValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
