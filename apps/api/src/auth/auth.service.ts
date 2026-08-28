import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { SignupDto } from "./auth.dto";
import type { AuthenticatedUser, JwtPayload } from "./jwt-payload.interface";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.active) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return { id: user.id, email: user.email, role: user.role, organizationId: user.organizationId };
  }

  issueToken(user: AuthenticatedUser): { accessToken: string; expiresIn: string } {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };
    return {
      accessToken: this.jwtService.sign(payload),
      expiresIn: process.env.JWT_EXPIRES_IN ?? "8h",
    };
  }

  /** Self-serve tenant onboarding: creates a new Organization plus its first (ADMIN) user, then logs them in. */
  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.adminEmail } });
    if (existingUser) {
      throw new ConflictException("A user with this email already exists");
    }

    const slug = await this.generateUniqueSlug(dto.organizationName);
    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);

    const admin = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: { name: dto.organizationName, slug } });
      return tx.user.create({
        data: {
          organizationId: organization.id,
          name: dto.adminName,
          email: dto.adminEmail,
          passwordHash,
          role: "ADMIN",
        },
      });
    });

    const user: AuthenticatedUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      organizationId: admin.organizationId,
    };
    return { user, ...this.issueToken(user) };
  }

  private async generateUniqueSlug(organizationName: string): Promise<string> {
    const base =
      organizationName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "org";

    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const existing = await this.prisma.organization.findUnique({ where: { slug: candidate } });
      if (!existing) return candidate;
    }
    throw new ConflictException("Could not generate a unique identifier for this organization name");
  }
}
