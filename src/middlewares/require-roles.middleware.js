import { HTTP_STATUS } from "../constants/http-status.constant.js";
import { MESSAGES } from "../constants/message.constant.js";

export const requireRoles = (roles) => {
  return (req, res, next) => {
    try {
      // 1. 받은 정보
      const user = req.user;
      // 2. 해당 유저가 권한을 가지고 있는지 판단
      const hasPermission = user && roles.includes(user.role);
      // 2-1. 권한을 가지고 있지 않다면?
      if (!hasPermission) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          status: HTTP_STATUS.FORBIDDEN,
          message: MESSAGES.RESUMES.COMMON.FORBIDDEN,
        });
      }
      // 3. 권한을 가지고 있다면 다음으로 진행
      next();
    } catch (err) {
      next(err);
    }
  };
};
