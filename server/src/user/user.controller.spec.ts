import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { AuthGuard } from './auth.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            login: jest.fn(),
            update: jest.fn(),
            updateProfilePicture: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  describe('findAll', () => {
    it('should call usersService.findAll()', async () => {
      const expected = [{ id: '1' }];
      usersService.findAll.mockResolvedValue(expected as any);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should call usersService.findOne(id)', async () => {
      const expected = { id: '1', firstName: 'John' };
      usersService.findOne.mockResolvedValue(expected as any);

      const result = await controller.findOne('1');

      expect(usersService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should call usersService.create(dto)', async () => {
      const dto = { firstName: 'J', lastName: 'D', email: 'j@t.com', password: 'pass1234' };
      const expected = { id: '1', ...dto };
      usersService.create.mockResolvedValue(expected as any);

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    it('should return user and token on success', async () => {
      const dto = { email: 'j@t.com', password: 'pass' };
      const expected = { user: { id: '1' }, token: 'jwt' };
      usersService.login.mockResolvedValue(expected as any);

      const result = await controller.login(dto);

      expect(usersService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      usersService.login.mockResolvedValue(null);

      await expect(
        controller.login({ email: 'j@t.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should call usersService.update(id, dto)', async () => {
      const dto = { firstName: 'Updated' };
      const expected = { id: '1', firstName: 'Updated' };
      usersService.update.mockResolvedValue(expected as any);

      const result = await controller.update('1', dto as any);

      expect(usersService.update).toHaveBeenCalledWith('1', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('uploadProfilePicture', () => {
    it('should call usersService.updateProfilePicture(id, file)', async () => {
      const file = { originalname: 'pic.png' } as Express.Multer.File;
      const expected = { id: '1', profilePictureUrl: 'http://url' };
      usersService.updateProfilePicture.mockResolvedValue(expected as any);

      const result = await controller.uploadProfilePicture('1', file);

      expect(usersService.updateProfilePicture).toHaveBeenCalledWith('1', file);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should call usersService.remove(id)', async () => {
      usersService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(usersService.remove).toHaveBeenCalledWith('1');
    });
  });
});
