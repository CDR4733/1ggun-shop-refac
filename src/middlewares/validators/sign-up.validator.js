import Joi from "joi";
import { MESSAGES } from "../../constants/message.constant.js";
import { MIN_PASSWORD_LENGTH } from "../../constants/auth.constant.js";

const schema = Joi.object({
  email: Joi.string().email().required().messages({
    "any.required": MESSAGES.AUTH.COMMON.EMAIL.REQUIRED,
    "string.email": MESSAGES.AUTH.SIGN_UP.FAIL.EMAIL.INVALID_FORMAT,
  }),
  password: Joi.string().required().min(MIN_PASSWORD_LENGTH).messages({
    "any.required": MESSAGES.AUTH.COMMON.PASSWORD.REQUIRED,
    "string.min": MESSAGES.AUTH.SIGN_UP.FAIL.PASSWORD.MIN_LENGTH,
  }),
  passwordConfirm: Joi.string()
    .required()
    .valid(Joi.ref("password")) // password와 같은지 확인
    .messages({
      "any.required": MESSAGES.AUTH.COMMON.PASSWORD_CONFIRM.REQUIRED,
      "any.only": MESSAGES.AUTH.SIGN_UP.FAIL.PASSWORD.NOT_MATCHED,
    }),
  name: Joi.string().required().messages({
    "any.required": MESSAGES.AUTH.COMMON.NAME.REQUIRED,
  }),
});

export const signUpValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
