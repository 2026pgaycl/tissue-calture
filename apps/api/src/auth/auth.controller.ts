import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, SignupDto } from "./auth.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "./jwt-payload.interface";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    return { user, ...this.authService.issueToken(user) };
  }

  /** Self-serve tenant onboarding: new Organization + its first ADMIN user, no auth required. */
  @Public()
  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  /** Stateless reissue of a fresh token for the caller's current session; not a rotating refresh-token flow. */
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.issueToken(user);
  }

  @Get("me")
  me(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
