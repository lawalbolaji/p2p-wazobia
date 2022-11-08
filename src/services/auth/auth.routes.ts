import { Request, Response, Router } from "express";
import { createNewUser, loginUser } from "./auth.service";
import { UserDetailsDto, validateWithPromise, validateWrapper } from "./dtos/userdetails.dto";
import { validate, ValidationError } from "class-validator";

const authRouter = Router();

authRouter.post("/create-account", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new UserDetailsDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const token = await createNewUser(req.body as UserDetailsDto);
  if (!!token) {
    return res.status(201).json({ token });
  }

  return res.status(403).json({ message: "unable to create account" });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const passValidation = await validateWrapper(new UserDetailsDto({ ...req.body }), req, res);
  if (!passValidation) return;

  const token = await loginUser(req.body as UserDetailsDto);
  if (!!token) {
    return res.status(201).json({ token });
  }

  return res.status(403).json({ message: "invalid email or password supplied" });
});

export { authRouter };
