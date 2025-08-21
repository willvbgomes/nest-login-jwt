import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '../database/prisma.service';

const mockUser: User = {
  id: 'random-uuid',
  email: 'test@example.com',

  password: 'hashedpassword',
  createdAt: new Date(),
};

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
  },
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should return a user if a valid email is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await userService.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.findByEmail('notfound@email.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should return a user if a valid id is provided', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(userService.findById('random-uuid')).resolves.toEqual(
        mockUser,
      );
    });

    it('should throw NotFoundException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(userService.findById('not-found-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
