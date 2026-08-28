import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto, UpdateUserDto } from "./users.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(dto: CreateUserDto, organizationId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException("A user with this email already exists");
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { organizationId, name: dto.name, email: dto.email, passwordHash, role: dto.role },
    });
    const { passwordHash: _omit, ...safeUser } = user;
    return safeUser;
  }

  async update(id: string, dto: UpdateUserDto, organizationId: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, organizationId } });
    if (!existing) {
      throw new NotFoundException("User not found");
    }
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    const { passwordHash: _omit, ...safeUser } = user;
    return safeUser;
  }
}
