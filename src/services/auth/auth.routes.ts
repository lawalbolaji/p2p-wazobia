import { Request, Response, Router } from "express";
import { createNewUser, loginUser } from "./auth.service";
import { UserDetailsDto } from "./dtos/userdetails.dto";
import { body, validationResult } from "express-validator";

const authRouter = Router();

authRouter.post(
  "/create-account",
  body("Email").isString(),
  body("Password").isStrongPassword(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const token = await createNewUser(req.body as UserDetailsDto);

      return res.status(201).json({ token });
    } catch (error) {
      // log what is happening here
      return res
        .status(500)
        .json({ message: "error creating account, please contact support" });
    }
  }
);

authRouter.post(
  "/login",
  body("Email").isString(),
  body("Password").isString(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const token = await loginUser(req.body as UserDetailsDto);

      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(401).json({ message: error?.message });
    }
  }
);

export { authRouter };
