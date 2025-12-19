import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.repository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.repository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'firstName', 'lastName'],
    });
  }

  create(userData: Partial<User>): User {
    return this.repository.create(userData);
  }

  save(user: User): Promise<User> {
    return this.repository.save(user);
  }

  update(id: string, userData: Partial<User>): Promise<any> {
    return this.repository.update(id, userData);
  }

  delete(id: string): Promise<any> {
    return this.repository.delete(id);
  }
}
