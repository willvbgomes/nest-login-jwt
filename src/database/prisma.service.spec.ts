import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  it('should call $connect on onModuleInit', async () => {
    const connectSpy = jest
      .spyOn(prismaService, '$connect')
      .mockResolvedValue();

    await prismaService.onModuleInit();

    expect(connectSpy).toHaveBeenCalledTimes(1);
    connectSpy.mockRestore();
  });

  it('should call $disconnect on onModuleDestroy', async () => {
    const disconnectSpy = jest
      .spyOn(prismaService, '$disconnect')
      .mockResolvedValue();

    await prismaService.onModuleDestroy();

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
    disconnectSpy.mockRestore();
  });
});
